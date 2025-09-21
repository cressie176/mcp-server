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

  pipeTo(destination) {
    this.pipe(destination);
    return this;
  }

  pipeFrom(source) {
    source.pipe(this);
    return this;
  }
}

export default LoggingTee;
