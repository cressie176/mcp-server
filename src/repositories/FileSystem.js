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
    const text = await this.fetch(url);
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

  buildResourceUrl(path) {
    return this.#buildUrl(`resources/${path}`);
  }

  buildPromptUrl(path) {
    return this.#buildUrl(`prompts/${path}`);
  }

  #buildBasePath({ path }) {
    return resolve(path);
  }

  #buildUrl(relativePath) {
    const path = join(this.#basePath, relativePath);
    return pathToFileURL(path).href;
  }
}

export default FileSystem;
