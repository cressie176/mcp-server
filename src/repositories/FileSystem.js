import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

class FileSystem {
  #basePath;
  #index = {};

  constructor(config) {
    this.#basePath = this.#buildBasePath(config);
  }

  async init() {
    const path = this.#buildPath('index.json');
    const text = await this.fetch(path);
    this.#index = JSON.parse(text);
  }

  resources(cb) {
    this.#index.resources?.forEach(cb);
  }

  prompts(cb) {
    this.#index.prompts?.forEach(cb);
  }

  async fetch(path) {
    return readFileSync(path, 'utf8');
  }

  buildResourceUrl(name) {
    return this.#buildPath(`resources/${name}.md`);
  }

  buildPromptUrl(name) {
    return this.#buildPath(`prompts/${name}.md`);
  }

  #buildBasePath({ path }) {
    return resolve(path);
  }

  #buildPath(relativePath) {
    return join(this.#basePath, relativePath);
  }
}

export default FileSystem;
