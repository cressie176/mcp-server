import { Writable } from 'node:stream';

class TestOutputStream extends Writable {
  #queue = [];

  waitForReply() {
    return new Promise((resolve, reject) => this.#queue.push({ resolve, reject }));
  }

  _write(chunk, encoding, cb) {
    this.#reply(this.#getWaiter(), chunk.toString());
    cb();
  }

  #getWaiter() {
    return this.#queue.shift();
  }

  #reply(waiter, line) {
    if (!waiter) return;
    try {
      waiter.resolve(JSON.parse(line));
    } catch (err) {
      waiter.reject(err);
    }
  }
}

export default TestOutputStream;
