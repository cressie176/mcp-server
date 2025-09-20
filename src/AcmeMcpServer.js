import { stdin, stdout } from 'node:process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import fs from 'fs';
import path from 'path';

const currentFileName = fileURLToPath(import.meta.url);
const currentDirectory = dirname(currentFileName);

class AcmeMcpServer {

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
    this.#server.registerResource(
      'code-standards',
      'https://raw.githubusercontent.com/cressie176/prompts/refs/heads/main/resources/code-standards.md',
      {
        title: 'ACME Code Standards',
        description: 'Latest ACME coding standards from GitHub',
        mimeType: 'text/markdown'
      },
      async (uri) => {
        const response = await fetch(uri.href);
        const text = await response.text();
        return {
          contents: [{
            uri: uri.href,
            text,
          }]
        };
      }
    )
  }

  #registerCodeReview() {
    this.#server.registerPrompt('code-review', {
      title: 'Code Review',
      description: 'Requests a code review',
    },
    () => {
      return {
        messages: [
          {
            role: 'user',
            content: { type: 'text', text: fs.readFileSync(path.join(currentDirectory, '..', 'prompts', 'code-review.md'), 'utf-8') }
          }
        ]
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport(this.#stdin, this.#stdout);
    await this.#server.connect(transport);
  }

  async stop() {
    await this.#server.close();
  }
}

export default AcmeMcpServer;
