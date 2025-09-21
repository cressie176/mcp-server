import { stdin, stdout } from 'node:process';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as Logger from './Logger.js';
import LoggingTee from './LoggingTee.js';

const defaults = { stdin, stdout };

class Server {
  #stdin;
  #stdout;
  #repository;
  #server;

  constructor(options) {
    const { stdin, stdout, repository } = { ...defaults, ...options };

    this.#stdout = new LoggingTee('STDOUT').pipeTo(stdout);
    this.#stdin = new LoggingTee('STDIN').pipeFrom(stdin);
    this.#repository = repository;
    this.#server = new McpServer({ name: 'ACME', version: '1.0.0' });
  }

  async start() {
    try {
      Logger.debug('Starting server');
      await this.#repository.init();
      this.#registerResources();
      this.#registerPrompts();
      const transport = new StdioServerTransport(this.#stdin, this.#stdout);
      await this.#server.connect(transport);
      Logger.debug('Server started');
    } catch (err) {
      Logger.error('Error starting server', err);
    }
  }

  async stop() {
    Logger.debug('Stopping server');
    this.#stdin.unpipe?.();
    this.#stdout.unpipe?.();
    await this.#server.close();
    Logger.debug('Server stopped');
  }

  #registerResources() {
    this.#repository.resources((resource) => {
      try {
        const url = this.#repository.buildResourceUrl(resource.name);
        this.#registerResource(resource, url);
      } catch (err) {
        Logger.error(`Error registering resource ${resource.name}`, err);
      }
    });
  }

  #registerResource(resource, url) {
    Logger.debug(`Registering resource ${resource.name} with ${url}`);
    this.#server.registerResource(resource.name, url, this.#getResourceMetaData(resource), async (uri) => {
      Logger.debug(`Fetching resource ${uri.href}`);
      return this.#fetchResource(uri.href);
    });
  }

  #registerPrompts() {
    this.#repository.prompts((prompt) => {
      try {
        this.#registerPrompt(prompt);
      } catch (err) {
        Logger.error(`Error registering prompt ${prompt.name}`, err);
      }
    });
  }

  #registerPrompt(prompt) {
    Logger.debug(`Registering prompt ${prompt.name}`);
    this.#server.registerPrompt(prompt.name, this.#getPromptMetaData(prompt), async () => {
      const uri = this.#repository.buildPromptUrl(prompt.name);
      Logger.debug(`Fetching prompt ${prompt.name} from ${uri}`);
      return this.#fetchPrompt(uri);
    });
  }

  #getResourceMetaData({ name, description }) {
    return { title: name, description, mimeType: 'text/markdown' };
  }

  #getPromptMetaData({ name, description }) {
    return { title: name, description };
  }

  async #fetchResource(uri) {
    const text = await this.#repository.fetch(uri);
    return this.#createResource(uri, text);
  }

  #createResource(uri, text) {
    const contents = [{ uri, text }];
    return { contents };
  }

  async #fetchPrompt(url) {
    const text = await this.#repository.fetch(url);
    return this.#createPrompt(text);
  }

  #createPrompt(text) {
    const content = { type: 'text', text };
    const messages = [{ role: 'user', content }];
    return { messages };
  }
}

export default Server;
