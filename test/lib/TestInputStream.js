import { Readable } from 'node:stream';
import { EOL } from 'node:os';
import Debug from 'debug';

const debug = Debug('mcp:client');

class TestInputStream extends Readable {

  _read() {
    // Required for Readable streams, but we push data manually
  }

  send(json) {
    debug(json.replace(EOL, ''));
    this.push(json);
  }

  end() {
    this.push(null);
  }
}

export default TestInputStream;
