class GitHub {
  #baseUrl;
  #index = {};

  constructor(config) {
    this.#baseUrl = this.#buildBaseUrl(config);
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

  async fetch(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url} ${response.status}`);
    return response.text();
  }

  buildResourceUrl(name) {
    return this.#buildUrl(`resources/${name}.md`);
  }

  buildPromptUrl(name) {
    return this.#buildUrl(`prompts/${name}.md`);
  }

  #buildBaseUrl({ user, organisation, repository, ref = 'heads/main', path }) {
    return ['https://raw.githubusercontent.com', user, organisation, repository, 'refs', ref, path]
      .filter(Boolean)
      .join('/');
  }

  #buildUrl(path) {
    return `${this.#baseUrl}/${path}`;
  }
}

export default GitHub;
