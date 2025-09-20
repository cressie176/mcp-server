import { strictEqual as eq, match } from 'node:assert';
import { after, before, describe, it } from 'node:test';
import Server, { GITHUB_BASE_URL } from '../src/Server.js';
import TestInputStream from './lib/TestInputStream.js';
import TestOutputStream from './lib/TestOutputStream.js';

describe('Server', () => {
  const stdin = new TestInputStream();
  const stdout = new TestOutputStream();
  const server = new Server({ stdin, stdout });

  before(async () => {
    await server.start();
  });

  after(async () => {
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
      const {
        result: { resources },
      } = await request({ method: 'resources/list' });
      eq(resources.length, 1);
      eq(resources[0].name, 'code-standards');
      eq(resources[0].title, 'code-standards');
      eq(resources[0].uri, `${GITHUB_BASE_URL}/resources/code-standards.md`);
    });

    it('resources/read coding-standards', async () => {
      const {
        result: { contents },
      } = await request({
        method: 'resources/read',
        params: { uri: `${GITHUB_BASE_URL}/resources/code-standards.md` },
      });
      eq(contents.length, 1);
      eq(contents[0].uri, `${GITHUB_BASE_URL}/resources/code-standards.md`);
      match(contents[0].text, /# Code Standards/);
    });
  });

  describe('prompts', () => {
    it('prompts/list', async () => {
      const {
        result: { prompts },
      } = await request({ method: 'prompts/list' });
      eq(prompts.length, 1);
      eq(prompts[0].name, 'code-review');
      eq(prompts[0].title, 'code-review');
      eq(prompts[0].description, 'Requests a code review');
    });

    it('prompts/get code-review', async () => {
      const {
        result: { messages },
      } = await request({ method: 'prompts/get', params: { name: 'code-review' } });
      eq(messages.length, 1);
      eq(messages[0].role, 'user');
      eq(messages[0].content.type, 'text');
      match(messages[0].content.text, /Perform a code review using the following process/);
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
