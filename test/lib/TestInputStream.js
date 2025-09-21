import { Readable } from 'node:stream';

class TestInputStream extends Readable {
  _read() {
    // We include an empty _read implementation because it is required by the Readable contract
    // Without it the tests will block
  }

  request(json) {
    this.push(`${json}\n`);
  }

  end() {
    this.push(null);
  }
}

export default TestInputStream;
