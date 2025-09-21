import { stdin, stdout } from 'node:process';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import z from 'zod';
import { Eta } from 'eta';

const RESOURCES = [{ name: 'code-standards', description: 'The latest ACME coding standards' }];
const CODE_REVIEW_SCOPES = ['all', 'unstaged', 'staged'];
const PROMPTS = [
  {
    name: 'code-review',
    description: 'Requests a code review',
    argsSchema: {
      scope: z.enum(CODE_REVIEW_SCOPES).optional().describe('One of "all", "unstaged" or "staged"')
    }
  },
];
const eta = new Eta();

class Server {
  #stdin;
  #stdout;
  #store;
  #server;

  constructor(options = { stdin, stdout }) {
    this.#stdin = options.stdin;
    this.#stdout = options.stdout;
    this.#store = options.store;
    this.#server = new McpServer({ name: 'ACME', version: '1.0.0' });
    this.#init();
  }

  async start() {
    const transport = new StdioServerTransport(this.#stdin, this.#stdout);
    await this.#server.connect(transport);
  }

  async stop() {
    await this.#server.close();
  }

  #init() {
    this.#registerResources();
    this.#registerPrompts();
  }

  #registerResources() {
    RESOURCES.forEach((resource) => this.#server.registerResource(
      resource.name,
      this.#store.buildResourceUrl(resource.name),
      this.#getResourceMetaData(resource),
      (uri) => this.#fetchResource(uri),
    ));
  }

  #registerPrompts() {
    PROMPTS.forEach((prompt) => this.#server.registerPrompt(
      prompt.name,
      this.#getPromptMetaData(prompt),
      (args) => this.#fetchPrompt(this.#store.buildPromptUrl(prompt.name), args),
    ));
  }

  #getResourceMetaData({ name, description }) {
    return { title: name, description, mimeType: 'text/markdown' };
  }

  #getPromptMetaData({ name, description, argsSchema }) {
    return { title: name, description, argsSchema };
  }

  async #fetchResource(uri) {
    const text = await this.#store.fetch(uri);
    return this.#createResource(uri, text);
  }

  #createResource(uri, text) {
    const contents = [{ uri, text }];
    return { contents };
  }

  async #fetchPrompt(url, args) {
    const template = await this.#store.fetch(url);
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
