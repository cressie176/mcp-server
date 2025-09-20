import { stdin, stdout } from 'node:process';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/cressie176/mcp-server/refs/heads/main';
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

  #init() {
    this.#registerCodeStandards();
    this.#registerCodeReview();
  }

  #registerCodeStandards() {
    RESOURCES.forEach(({ name, description }) =>
      this.#server.registerResource(
        name,
        this.#getResourceUrl(name),
        this.#getResourceMetaData(name, description),
        (uri) => this.#fetchResource(uri.href),
      ),
    );
  }

  #registerCodeReview() {
    PROMPTS.forEach(({ name, description }) =>
      this.#server.registerPrompt(name, this.#getPromptMetaData(name, description), () =>
        this.#fetchPrompt(this.#getPromptUrl(name)),
      ),
    );
  }

  #getResourceUrl(name) {
    return `${GITHUB_BASE_URL}/resources/${name}.md`;
  }

  #getPromptUrl(name) {
    return `${GITHUB_BASE_URL}/prompts/${name}.md`;
  }

  #getResourceMetaData(name, description) {
    return { title: name, description, mimeType: 'text/markdown' };
  }

  #getPromptMetaData(name, description) {
    return { title: name, description };
  }

  async #fetchResource(url) {
    const text = await this.#fetch(url);
    const contents = [{ uri: url, text }];
    return { contents };
  }

  async #fetchPrompt(url) {
    const text = await this.#fetch(url);
    const content = { type: 'text', text };
    const messages = [{ role: 'user', content }];
    return { messages };
  }

  async #fetch(uri) {
    const response = await fetch(uri);
    return response.text();
  }

  async start() {
    const transport = new StdioServerTransport(this.#stdin, this.#stdout);
    await this.#server.connect(transport);
  }

  async stop() {
    await this.#server.close();
  }
}

export default Server;

export { GITHUB_BASE_URL };
