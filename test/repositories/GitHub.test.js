import { strictEqual as eq, match, rejects } from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import nock from 'nock';
import op from 'object-path-immutable';
import GitHub from '../../src/repositories/GitHub.js';

describe('GitHub', () => {
  let repository;
  let scope;

  const emptyIndex = { resources: [], prompts: [] };

  function stubIndex(data = emptyIndex) {
    return scope.get('/testuser/testrepo/refs/heads/main/testpath/index.json').reply(200, JSON.stringify(data));
  }

  function stubFile(path, content) {
    return scope.get(`/testuser/testrepo/refs/heads/main/testpath/${path}`).reply(200, content);
  }

  beforeEach(() => {
    repository = new GitHub({
      user: 'testuser',
      repository: 'testrepo',
      ref: 'heads/main',
      path: 'testpath',
    });

    scope = nock('https://raw.githubusercontent.com').persist();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('resources', () => {
    it('iterates over resources', async () => {
      const index = op.set(emptyIndex, 'resources', [
        { name: 'code-standards', path: 'code-standards.md', description: 'Code Standards' },
      ]);
      stubIndex(index);

      await repository.init();
      const resources = [];
      repository.resources((resource) => resources.push(resource));

      eq(resources.length, 1);
      eq(resources[0].name, 'code-standards');
      eq(resources[0].path, 'code-standards.md');
      eq(resources[0].description, 'Code Standards');
    });
  });

  describe('prompts', () => {
    it('iterates over prompts', async () => {
      const index = op.set(emptyIndex, 'prompts', [
        { name: 'code-review', path: 'code-standards.md', description: 'Code Review' },
      ]);

      stubIndex(index);

      await repository.init();
      const prompts = [];
      repository.prompts((prompt) => prompts.push(prompt));

      eq(prompts.length, 1);
      eq(prompts[0].name, 'code-review');
      eq(prompts[0].path, 'code-standards.md');
      eq(prompts[0].description, 'Code Review');
    });
  });

  describe('fetch', () => {
    it('fetches content from URL', async () => {
      stubIndex();
      stubFile('resources/code-standards.md', '# Code Standards\n\nThese are the test code standards.');

      await repository.init();
      const url = repository.buildResourceUrl('code-standards.md');
      const content = await repository.fetch(url);

      eq(content.includes('# Code Standards'), true);
      eq(content.includes('These are the test code standards.'), true);
    });

    it('throws error on HTTP failure', async () => {
      scope.get('/testuser/testrepo/refs/heads/main/testpath/resources/missing.md').reply(404, 'Not Found');

      const url = repository.buildResourceUrl('missing.md');
      await rejects(
        () => repository.fetch(url),
        (err) => {
          match(err.message, /missing.md 404/);
          return true;
        },
      );
    });
  });

  describe('buildResourceUrl', () => {
    it('builds resource URL', () => {
      const url = repository.buildResourceUrl('documents/code-standards.md');
      eq(
        url,
        'https://raw.githubusercontent.com/testuser/testrepo/refs/heads/main/testpath/resources/documents/code-standards.md',
      );
    });

    it('uses default ref when not specified', () => {
      const repo = new GitHub({ user: 'testuser', repository: 'testrepo' });

      const url = repo.buildResourceUrl('test.md');
      match(url, /refs\/heads\/main/);
    });

    it('uses custom ref when specified', () => {
      const repo = new GitHub({ user: 'testuser', repository: 'testrepo', ref: 'tags/stable' });

      const url = repo.buildResourceUrl('test.md');
      match(url, /refs\/tags\/stable/);
    });

    it('uses organisation instead of user', () => {
      const repo = new GitHub({ organisation: 'testorg', repository: 'testrepo' });

      const url = repo.buildResourceUrl('test.md');
      match(url, /testorg\/testrepo/);
    });

    it('handles missing path parameter', () => {
      const repo = new GitHub({ user: 'testuser', repository: 'testrepo' });

      const url = repo.buildResourceUrl('test.md');
      match(url, /testrepo\/refs\/heads\/main\/resources\/test\.md$/);
    });
  });

  describe('buildPromptUrl', () => {
    it('builds prompt URL', () => {
      const url = repository.buildPromptUrl('code-review.md');
      eq(url, 'https://raw.githubusercontent.com/testuser/testrepo/refs/heads/main/testpath/prompts/code-review.md');
    });

    it('uses default ref when not specified', () => {
      const repo = new GitHub({ user: 'testuser', repository: 'testrepo' });

      const url = repo.buildPromptUrl('test.md');
      match(url, /refs\/heads\/main/);
    });

    it('uses custom ref when specified', () => {
      const repo = new GitHub({ user: 'testuser', repository: 'testrepo', ref: 'tags/stable' });

      const url = repo.buildPromptUrl('test.md');
      match(url, /refs\/tags\/stable/);
    });

    it('uses organisation instead of user', () => {
      const repo = new GitHub({ organisation: 'testorg', repository: 'testrepo' });

      const url = repo.buildPromptUrl('test.md');
      match(url, /testorg\/testrepo/);
    });

    it('handles missing path parameter', () => {
      const repo = new GitHub({ user: 'testuser', repository: 'testrepo' });

      const url = repo.buildPromptUrl('test.md');
      match(url, /testrepo\/refs\/heads\/main\/prompts\/test\.md$/);
    });
  });
});
