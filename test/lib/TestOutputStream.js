import { Writable } from 'node:stream';
import { EOL } from 'node:os';
import Debug from 'debug';

const debug = Debug('mcp:server');


class TestOutputStream extends Writable {
  #buffer = '';
  #queue = [];

  waitForResponse() {
    return new Promise((resolve, reject ) => this.#queue.push({ resolve, reject }));
  }

  _write(chunk, encoding, cb) {
    this.#buffer += chunk.toString();

    for (;;) {
      const nl = this.#buffer.indexOf(EOL);
      if (nl === -1) break;

      const line = this.#buffer.slice(0, nl);
      this.#buffer = this.#buffer.slice(nl + 1);

      const waiter = this.#queue.shift();
      if (waiter) {
        const { resolve, reject } = waiter;
        try {
          debug(line);
          resolve(JSON.parse(line));
        } catch (err) {
          reject(err);
        }
      } else {
        console.log('RECEIVED (no waiter)', line);
      }
    }

    cb();
  }
}

export default TestOutputStream;
