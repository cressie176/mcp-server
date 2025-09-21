class GitHub {

  #baseUrl;

  constructor({ user, organisation, repository }) {
    this.#baseUrl = `https://raw.githubusercontent.com/${user || organisation}/${repository}/refs/heads/main`
  }

  async fetch(url) {
    const response = await fetch(url);
    return response.text();
  }

  buildResourceUrl(name) {
    return this.#buildUrl('resources', name);
  }

  buildPromptUrl(name) {
    return this.#buildUrl('prompts', name);
  }

  #buildUrl(type, name) {
    return `${this.#baseUrl}/${type}/${name}.md`;
  }
}

export default GitHub;
