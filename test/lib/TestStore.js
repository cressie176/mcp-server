class TestStore {

  #artifacts = {};

  init() {
  }

  async reset() {
    this.#artifacts = {};
  }

  async fetch(uri) {
    return this.#artifacts[uri];
  }

  resources(cb) {
    this.#forEach('resources', cb);
  }

  prompts(cb) {
    this.#forEach('prompts', cb);
  }

  #forEach(type, cb) {
    Object.values(this.#artifacts).filter((entry) => entry.type === type).forEach(cb);
  }

  putResource(name, contents) {
    const uri = this.buildResourceUrl(name);
    this.#put(uri, { type: 'resource', contents });
    return uri;
  }

  putPrompt(name, contents) {
    const uri = this.buildPromptUrl(name);
    this.#put(uri, { type: 'prompt', contents });
    return uri;
  }

  #put(uri, entry) {
    this.#artifacts[uri] = entry;
  }

  buildResourceUrl(name) {
    return this.#buildUrl('resources', name);
  }

  buildPromptUrl(name) {
    return this.#buildUrl('prompts', name);
  }

  #buildUrl(type, name) {
    return `test://${type}/${name}`;
  }
}

export default TestStore;
