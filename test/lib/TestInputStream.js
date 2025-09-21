import { Readable } from 'node:stream';
import Logger from '../../src/Logger.js';

class TestInputStream extends Readable {
  _read() {
    // We include an empty _read implementation because it is required by the Readable contract
    // Without it the tests will block
  }

  request(json) {
    Logger.debug(`TestInputStream: ${json}`);
    this.push(`${json}\n`);
  }

  end() {
    this.push(null);
  }
}

export default TestInputStream;
