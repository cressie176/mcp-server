import { Readable } from 'node:stream';
import Debug from 'debug';

const debug = Debug('mcp:client');

class TestInputStream extends Readable {
  _read() {
    // We include an empty _read implementation because it is required by the Readable contract
    // Without it the tests will block
  }

  request(json) {
    debug(json);
    this.push(`${json}\n`);
  }

  end() {
    this.push(null);
  }
}

export default TestInputStream;
