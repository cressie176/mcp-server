class TestClient {

  #stdin;
  #stdout;
  #count = 0;

  constructor({ stdin, stdout }) {
    this.#stdin = stdin;
    this.#stdout = stdout;
  }

  async ping() {
    return this.#request({ method: 'ping' })
  }

  async listResources() {
    const { result } = await this.#request({ method: 'resources/list' });
    return result.resources;
  }

  async readResource(uri) {
    const params = { uri };
    const { result } = await this.#request({ method: 'resources/read', params });
    return result.contents;
  }

  async listPrompts() {
    const { result } = await this.#request({ method: 'prompts/list' });
    return result.prompts;
  }

  async getPrompt(name, args = {}) {
    const params = { name, arguments: args }
    const { result } = await this.#request({ method: 'prompts/get', params });
    return result.messages;
  }

  async #request(operation) {
    const json = JSON.stringify({ jsonrpc: '2.0', id: ++this.#count, ...operation });
    this.#stdin.request(json);
    const response = await this.#stdout.waitForReply();
    if (response.error) throw new Error(response.error.message);
    return response;
  }
}

export default TestClient;
