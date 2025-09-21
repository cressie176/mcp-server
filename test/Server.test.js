import { strictEqual as eq, match } from 'node:assert';
import { after, before, describe, it } from 'node:test';
import Server from '../src/Server.js';
import TestStore from './lib/TestStore.js';
import TestInputStream from './lib/TestInputStream.js';
import TestOutputStream from './lib/TestOutputStream.js';

const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/cressie176/mcp-server/refs/heads/main';

describe('Server', () => {
  const stdin = new TestInputStream();
  const stdout = new TestOutputStream();
  const store = new TestStore()
  const server = new Server({ stdin, stdout, store });

  before(async () => {
    await server.start();
  });

  after(async () => {
    store.reset();
    await server.stop();
  });

  describe('ping', () => {
    it('responds', async () => {
      const { jsonrpc, id } = await request({ id: 999, method: 'ping' });
      eq(jsonrpc, '2.0');
      eq(id, 999);
    });
  });

  describe('resources', () => {
    it('resources/list', async () => {
      store.putResource('code-standards', 'Code Standards Yay!');
      const {
        result: { resources },
      } = await request({ method: 'resources/list' });
      eq(resources.length, 1);
      eq(resources[0].name, 'code-standards');
      eq(resources[0].title, 'code-standards');
      eq(resources[0].uri, `test://resources/code-standards`);
    });

    it('resources/read coding-standards', async () => {
      store.putResource('code-standards', 'Code Standards Yay!');
      const {
        result: { contents },
      } = await request({
        method: 'resources/read',
        params: { uri: `test://resources/code-standards` },
      });
      eq(contents.length, 1);
      eq(contents[0].uri, `test://resources/code-standards`);
      eq(contents[0].text, 'Code Standards Yay!');
    });
  });

  describe('prompts', () => {
    it('prompts/list', async () => {
      store.putPrompt('code-review', 'Code Review Yay!');
      const {
        result: { prompts },
      } = await request({ method: 'prompts/list' });
      eq(prompts.length, 1);
      eq(prompts[0].name, 'code-review');
      eq(prompts[0].title, 'code-review');
      eq(prompts[0].description, 'Requests a code review');
    });

    it('prompts/get code-review', async () => {
      store.putPrompt('code-review', 'Code Review Yay!');
      const {
        result: { messages },
      } = await request({ method: 'prompts/get', params: { name: 'code-review', arguments: {} } });
      eq(messages.length, 1);
      eq(messages[0].role, 'user');
      eq(messages[0].content.type, 'text');
      eq(messages[0].content.text, 'Code Review Yay!');
    });
  });

  async function request(operation) {
    const reply = stdout.waitForReply();
    const json = JSON.stringify({ jsonrpc: '2.0', id: generateId(), ...operation });
    stdin.request(json);
    return reply;
  }

  function generateId() {
    return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) + 1;
  }
});
