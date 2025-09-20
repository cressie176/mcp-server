import { Readable } from 'node:stream';
import { EOL } from 'node:os';
import Debug from 'debug';

const debug = Debug('mcp:client');

class TestInputStream extends Readable {

  _read() {
    // Empty implementation prevents test blocking - Readable stream contract requires this method
  }

  send(json) {
    debug(json);
    this.push(json + `\n`);
  }

  end() {
    this.push(null);
  }
}

export default TestInputStream;
