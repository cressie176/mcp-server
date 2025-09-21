import { strictEqual as eq, match } from 'node:assert';
import { after, before, describe, it } from 'node:test';
import Server from '../src/Server.js';
import TestStore from './lib/TestStore.js';
import TestInputStream from './lib/TestInputStream.js';
import TestOutputStream from './lib/TestOutputStream.js';
import TestClient from './lib/TestClient.js';

const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/cressie176/mcp-server/refs/heads/main';

describe('Server', () => {
  const stdin = new TestInputStream();
  const stdout = new TestOutputStream();
  const store = new TestStore()
  const server = new Server({ stdin, stdout, store });
  const client = new TestClient({ stdin, stdout });

  before(async () => {
    await server.start();
  });

  after(async () => {
    await server.stop();
  });

  describe('ping', () => {
    it('responds', async () => {
      const { jsonrpc } = await client.ping();
      eq(jsonrpc, '2.0');
    });
  });

  describe('resources', () => {
    it('resources/list', { only: true }, async () => {
      const uri = store.putResource('code-standards', 'Code Standards Yay!');
      const resources = await client.listResources();

      eq(resources.length, 1);
      eq(resources[0].name, 'code-standards');
      eq(resources[0].title, 'code-standards');
      eq(resources[0].uri, uri);
    });

    it('resources/read', async () => {
      const uri = store.putResource('code-standards', 'Code Standards Yay!');
      const contents = await client.readResource(uri);

      eq(contents.length, 1);
      eq(contents[0].uri, uri);
      eq(contents[0].text, 'Code Standards Yay!');
    });
  });

  describe('prompts', () => {
    it('prompts/list', async () => {
      store.putPrompt('code-review', 'Code Review Yay!');
      const prompts = await client.listPrompts();

      eq(prompts.length, 1);
      eq(prompts[0].name, 'code-review');
      eq(prompts[0].title, 'code-review');
      eq(prompts[0].description, 'Requests a code review');
    });

    it('prompts/get', async () => {
      store.putPrompt('code-review', 'Code Review Yay!');
      const messages = await client.getPrompt('code-review', { scope: 'unstaged' });

      eq(messages.length, 1);
      eq(messages[0].role, 'user');
      eq(messages[0].content.type, 'text');
      eq(messages[0].content.text, 'Code Review Yay!');
    });

    it('prompts/get template with defaults', async () => {
      store.putPrompt('code-review', 'Code Review (<%= it.scope %>)');
      const messages = await client.getPrompt('code-review');

      eq(messages.length, 1);
      eq(messages[0].role, 'user');
      eq(messages[0].content.type, 'text');
      eq(messages[0].content.text, 'Code Review (all)');
    });

    it('prompts/get template with arguments', async () => {
      store.putPrompt('code-review', 'Code Review (<%= it.scope %>)');
      const messages = await client.getPrompt('code-review', { scope: 'unstaged' });

      eq(messages.length, 1);
      eq(messages[0].role, 'user');
      eq(messages[0].content.type, 'text');
      eq(messages[0].content.text, 'Code Review (unstaged)');
    });
  });
});
