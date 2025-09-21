import { stdin, stdout } from 'node:process';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import Logger from './Logger.js';

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
    try {
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
    await this.#server.close();
    Logger.debug('Server stopped');
  }

  #registerResources() {
    this.#repository.resources((resource) => {
      const url = this.#repository.buildResourceUrl(resource.name);
      Logger.debug(`Registering resource ${resource.name} with ${url}`);
      try {
        this.#server.registerResource(resource.name, url, this.#getResourceMetaData(resource), async (uri) => {
          Logger.debug(`Fetching resource ${uri.href}`);
          return this.#fetchResource(uri.href);
        });
      } catch (err) {
        Logger.error(`Error registering resource ${resource.name}`, err);
      }
    });
  }

  #registerPrompts() {
    this.#repository.prompts((prompt) => {
      Logger.debug(`Registering prompt ${prompt.name}`);
      try {
        this.#server.registerPrompt(prompt.name, this.#getPromptMetaData(prompt), async () => {
          const uri = this.#repository.buildPromptUrl(prompt.name);
          Logger.debug(`Fetching prompt ${prompt.name} from ${uri}`);
          return this.#fetchPrompt(uri);
        });
      } catch (err) {
        Logger.error(`Error registering prompt ${prompt.name}`, err);
      }
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
