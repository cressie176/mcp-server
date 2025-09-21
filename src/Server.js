import { stdin, stdout } from 'node:process';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { convertJsonSchemaToZod } from 'zod-from-json-schema';
import z from "zod";
import { Eta } from 'eta';

const eta = new Eta();

class Server {
  #stdin;
  #stdout;
  #repository;
  #server;

  constructor(options) {
    this.#stdin = options.stdin || stdin;
    this.#stdout = options.stdout || stdout;
    this.#repository = options.repository;
    this.#server = new McpServer({ name: 'ACME', version: '1.0.0' });
  }

  async start() {
    await this.#repository.init();
    this.#registerResources();
    this.#registerPrompts();
    const transport = new StdioServerTransport(this.#stdin, this.#stdout);
    await this.#server.connect(transport);
  }

  async stop() {
    await this.#repository.reset();
    await this.#server.close();
  }

  #registerResources() {
    this.#repository.resources((resource) => {
      console.log('DEBUG:', 'Registering Resource', { resource });
      this.#server.registerResource(
        resource.name,
        this.#repository.buildResourceUrl(resource.name),
        this.#getResourceMetaData(resource),
        (uri) => this.#fetchResource(uri),
      )
    });
  }

  #registerPrompts() {
    this.#repository.prompts((prompt) => this.#server.registerPrompt(
      prompt.name,
      this.#getPromptMetaData(prompt),
      (args) => this.#fetchPrompt(this.#repository.buildPromptUrl(prompt.name), args),
    ));
  }

  #getResourceMetaData({ name, description }) {
    return { title: name, description, mimeType: 'text/markdown' };
  }

  #getPromptMetaData({ name, description, args = {} }) {
    return { title: name, description, argsSchema: this.#getArgsSchema(args) };
  }

  #getArgsSchema(args) {
    Object.keys(args).reduce((result, name) => {
      return {
        ...result,
        [name]: convertJsonSchemaToZod(args[name].schema),
      }
    }, {})
  }

  async #fetchResource(uri) {
    const text = await this.#repository.fetch(uri);
    return this.#createResource(uri, text);
  }

  #createResource(uri, text) {
    const contents = [{ uri, text }];
    return { contents };
  }

  async #fetchPrompt(url, args) {
    const template = await this.#repository.fetch(url);
    const text = eta.renderString(template, args);
    return this.#createPrompt(text);
  }

  #createPrompt(text) {
    const content = { type: 'text', text };
    const messages = [{ role: 'user', content }];
    return { messages };
  }
}

export default Server;
