class GitHub {

  #baseUrl;

  constructor({ user, repository }) {
    this.#baseUrl = `https://raw.githubusercontent.com/${user}/${repository}/refs/heads/main`;
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
