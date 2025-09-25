class TestRepository {
  #artifacts = {};

  async init() {}

  async fetch(uri) {
    return this.#artifacts[uri].content;
  }

  resources(cb) {
    this.#forEach('resource', cb);
  }

  prompts(cb) {
    this.#forEach('prompt', cb);
  }

  #forEach(type, cb) {
    Object.values(this.#artifacts)
      .filter((entry) => entry.type === type)
      .forEach(cb);
  }

  putResource(resource) {
    const uri = this.buildResourceUrl(resource.path);
    this.#put(uri, { type: 'resource', ...resource });
    return uri;
  }

  putPrompt(prompt) {
    const uri = this.buildPromptUrl(prompt.path);
    this.#put(uri, { type: 'prompt', ...prompt });
    return uri;
  }

  #put(uri, entry) {
    this.#artifacts[uri] = entry;
  }

  buildResourceUrl(path) {
    return this.#buildUrl('resources', path);
  }

  buildPromptUrl(path) {
    return this.#buildUrl('prompts', path);
  }

  #buildUrl(type, path) {
    return `test://${type}/${path}`;
  }
}

export default TestRepository;
