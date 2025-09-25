import { stdin, stdout } from 'node:process';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as Logger from './Logger.js';
import StreamSpy from './StreamSpy.js';

const defaults = { stdin, stdout };

class Server {
  #stdin;
  #stdout;
  #repository;
  #server;

  constructor(options) {
    const { stdin, stdout, repository } = { ...defaults, ...options };
    this.#stdout = new StreamSpy('STDOUT').pipeTo(stdout);
    this.#stdin = new StreamSpy('STDIN').pipeFrom(stdin);
    this.#repository = repository;
    this.#server = new McpServer({ name: 'ACME', version: '1.0.0' });
  }

  async start() {
    try {
      Logger.info('Starting server');
      await this.#repository.init();
      this.#registerResources();
      this.#registerPrompts();
      await this.#connect();
      Logger.info('Server started');
    } catch (err) {
      Logger.error('Error starting server', err);
    }
  }

  #connect() {
    const transport = new StdioServerTransport(this.#stdin, this.#stdout);
    return this.#server.connect(transport);
  }

  async stop() {
    Logger.info('Stopping server');
    this.#stdin.unpipe?.();
    this.#stdout.unpipe?.();
    await this.#server.close();
    Logger.info('Server stopped');
  }

  #registerResources() {
    this.#repository.resources((resource) => {
      try {
        const url = this.#repository.buildResourceUrl(resource.path);
        this.#registerResource(resource, url);
      } catch (err) {
        Logger.error(`Error registering resource ${resource.name}`, err);
      }
    });
  }

  #registerResource(resource, url) {
    Logger.info(`Registering resource ${resource.name} with ${url}`);
    this.#server.registerResource(resource.name, url, this.#getResourceMetaData(resource), async (uri) => {
      Logger.info(`Fetching resource ${resource.name} from ${uri.href}`);
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
    Logger.info(`Registering prompt ${prompt.name}`);
    this.#server.registerPrompt(prompt.name, this.#getPromptMetaData(prompt), async () => {
      const uri = this.#repository.buildPromptUrl(prompt.path);
      Logger.info(`Fetching prompt ${prompt.name} from ${uri}`, { prompt });
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
