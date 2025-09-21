import { strictEqual as eq } from 'node:assert';
import { resolve } from 'node:path';
import { beforeEach, describe, it } from 'node:test';
import FileSystem from '../../src/repositories/FileSystem.js';

describe('FileSystem', () => {
  let repository;

  beforeEach(() => {
    const path = resolve('./test/data');
    repository = new FileSystem({ path });
  });

  describe('resources', () => {
    it('iterates over resources', async () => {
      await repository.init();
      const resources = [];
      repository.resources((resource) => resources.push(resource));

      eq(resources.length, 1);
      eq(resources[0].name, 'code-standards');
      eq(resources[0].description, 'Code Standards');
    });
  });

  describe('prompts', () => {
    it('iterates over prompts', async () => {
      await repository.init();
      const prompts = [];
      repository.prompts((prompt) => prompts.push(prompt));

      eq(prompts.length, 1);
      eq(prompts[0].name, 'code-review');
      eq(prompts[0].description, 'Code Review');
    });
  });

  describe('fetch', () => {
    it('reads file content', async () => {
      await repository.init();
      const resourcePath = repository.buildResourceUrl('code-standards');
      const content = await repository.fetch(resourcePath);

      eq(content.includes('# Code Standards'), true);
      eq(content.includes('These are the test code standards.'), true);
    });
  });

  describe('buildResourceUrl', () => {
    it('builds resource path', () => {
      const path = repository.buildResourceUrl('code-standards');
      eq(path.endsWith('test/data/resources/code-standards.md'), true);
    });
  });

  describe('buildPromptUrl', () => {
    it('builds prompt path', () => {
      const path = repository.buildPromptUrl('code-review');
      eq(path.endsWith('test/data/prompts/code-review.md'), true);
    });
  });
});
