import { Writable } from 'node:stream';
import Debug from 'debug';

const debug = Debug('mcp:server');

class TestOutputStream extends Writable {
  #queue = [];

  waitForReply() {
    return new Promise((resolve, reject) => this.#queue.push({ resolve, reject }));
  }

  _write(chunk, encoding, cb) {
    this.#reply(this.#getWaiter(), this.#getLine(chunk));
    cb();
  }

  #getLine(chunk) {
    const line = chunk.toString();
    debug(line);
    return line;
  }

  #getWaiter() {
    return this.#queue.shift();
  }

  #reply(waiter, line) {
    if (!waiter) return debug(`Unexpected reply from server`);
    try {
      waiter.resolve(JSON.parse(line));
    } catch (err) {
      waiter.reject(err);
    }
  }
}

export default TestOutputStream;
