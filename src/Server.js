import { stdin, stdout } from 'node:process';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import Debug from 'debug';
import GitHub from './GitHub.js';

const github = new GitHub({ user: 'cressie176', repository: 'mcp-server' });
const RESOURCES = [{ name: 'code-standards', description: 'The latest ACME coding standards' }];
const PROMPTS = [{ name: 'code-review', description: 'Requests a code review' }];

class Server {
  #stdin;
  #stdout;
  #server;

  constructor(options = { stdin, stdout }) {
    this.#stdin = options.stdin;
    this.#stdout = options.stdout;
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
    RESOURCES.forEach((resource) => this.#registerResource(resource));
  }

  #registerResource({ name, description }) {
    this.#server.registerResource(
      name,
      github.buildResourceUrl(name),
      this.#getResourceMetaData(name, description),
      (uri) => this.#fetchResource(uri.href),
    );
  }

  #registerPrompts() {
    PROMPTS.forEach((prompt) => this.#registerPrompt(prompt));
  }

  #registerPrompt({ name, description }) {
    this.#server.registerPrompt(
      name,
      this.#getPromptMetaData(name, description),
      () => this.#fetchPrompt(github.buildPromptUrl(name)),
    );
  }

  #getResourceMetaData(name, description) {
    return { title: name, description, mimeType: 'text/markdown' };
  }

  #getPromptMetaData(name, description) {
    return { title: name, description };
  }

  async #fetchResource(url) {
    const text = await this.#fetch(url);
    return this.#createResource(url, text);
  }

  #createResource(uri, text) {
    const contents = [{ uri, text }];
    return { contents };
  }

  async #fetchPrompt(url) {
    const text = await this.#fetch(url);
    return this.#createPrompt(text);
  }

  #createPrompt(text) {
    const content = { type: 'text', text };
    const messages = [{ role: 'user', content }];
    return { messages };
  }

  async #fetch(url) {
    const response = await fetch(url);
    return response.text();
  }
}

export default Server;
