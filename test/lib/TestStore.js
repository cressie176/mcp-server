class TestStore {

  #artifacts = {};

  async fetch(uri) {
    return this.#artifacts[uri];
  }

  putResource(name, contents) {
    const uri = this.buildResourceUrl(name);
    this.#put(uri, contents);
  }

  putPrompt(name, contents) {
    const uri = this.buildPromptUrl(name);
    this.#put(uri, contents);
  }

  #put(uri, contents) {
    this.#artifacts[uri] = contents;
  }

  reset() {
    this.#artifacts = {};
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
