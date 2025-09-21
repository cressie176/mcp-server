import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

class FileSystem {
  #basePath;
  #index = {};

  constructor(config) {
    this.#basePath = this.#buildBasePath(config);
  }

  async init() {
    const url = this.#buildUrl('index.json');
    const text = await this.fetch(url.href);
    this.#index = JSON.parse(text);
  }

  resources(cb) {
    this.#index.resources?.forEach(cb);
  }

  prompts(cb) {
    this.#index.prompts?.forEach(cb);
  }

  async fetch(uri) {
    const path = fileURLToPath(uri);
    return readFileSync(path, 'utf8');
  }

  buildResourceUrl(name) {
    return this.#buildUrl(`resources/${name}.md`).href;
  }

  buildPromptUrl(name) {
    return this.#buildUrl(`prompts/${name}.md`).href;
  }

  #buildBasePath({ path }) {
    return resolve(path);
  }

  #buildUrl(relativePath) {
    const path = join(this.#basePath, relativePath);
    return pathToFileURL(path);
  }
}

export default FileSystem;
