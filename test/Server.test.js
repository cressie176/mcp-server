import { strictEqual as eq } from 'node:assert';
import { afterEach, before, beforeEach, describe, it } from 'node:test';
import Server from '../src/Server.js';
import TestClient from './lib/TestClient.js';
import TestInputStream from './lib/TestInputStream.js';
import TestOutputStream from './lib/TestOutputStream.js';
import TestRepository from './lib/TestRepository.js';

describe('Server', () => {
  let repository;
  let client;
  let server;

  before(() => {
    // Keep this, and uncomment it to debug tests
    // process.on('LOG', console.log);
  });

  beforeEach(() => {
    const stdin = new TestInputStream();
    const stdout = new TestOutputStream();
    client = new TestClient({ stdin, stdout });
    repository = new TestRepository();
    server = new Server({ stdin, stdout, repository });
  });

  afterEach(async () => {
    await server.stop();
  });

  describe('ping', () => {
    it('responds', { only: true }, async () => {
      await server.start();
      const { jsonrpc } = await client.ping();
      eq(jsonrpc, '2.0');
    });
  });

  describe('resources', () => {
    it('resources/list', async () => {
      const uri = repository.putResource({
        name: 'code-standards',
        description: 'Code Standards',
        content: 'Code Standards Yay!',
      });
      await server.start();

      const resources = await client.listResources();

      eq(resources.length, 1);
      eq(resources[0].name, 'code-standards');
      eq(resources[0].title, 'code-standards');
      eq(resources[0].description, 'Code Standards');
      eq(resources[0].mimeType, 'text/markdown');
      eq(resources[0].uri, uri);
    });

    it('resources/read', async () => {
      const uri = repository.putResource({
        name: 'code-standards',
        description: 'Code Standards',
        content: 'Code Standards Yay!',
      });
      await server.start();
      const contents = await client.readResource(uri);

      eq(contents.length, 1);
      eq(contents[0].uri, uri);
      eq(contents[0].text, 'Code Standards Yay!');
    });
  });

  describe('prompts', () => {
    it('prompts/list', async () => {
      repository.putPrompt({ name: 'code-review', description: 'Code Review', content: 'Code Review Yay!' });
      await server.start();

      const prompts = await client.listPrompts();

      eq(prompts.length, 1);
      eq(prompts[0].name, 'code-review');
      eq(prompts[0].title, 'code-review');
      eq(prompts[0].description, 'Code Review');
    });

    it('prompts/get', async () => {
      repository.putPrompt({ name: 'code-review', description: 'Code Review', content: 'Code Review Yay!' });
      await server.start();

      const messages = await client.getPrompt('code-review', { scope: 'unstaged' });

      eq(messages.length, 1);
      eq(messages[0].role, 'user');
      eq(messages[0].content.type, 'text');
      eq(messages[0].content.text, 'Code Review Yay!');
    });
  });
});
