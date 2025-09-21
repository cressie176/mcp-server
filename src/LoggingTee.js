import { Transform } from 'node:stream';
import Logger from './Logger.js';

class LoggingTee extends Transform {
  #name;

  constructor(name) {
    super();
    this.#name = name;
  }

  _transform(chunk, encoding, cb) {
    Logger.debug(`${this.#name}: ${chunk.toString('utf8')}`);
    this.push(chunk);
    cb();
  }
}

export default LoggingTee;
