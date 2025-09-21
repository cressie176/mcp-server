import { appendFileSync } from 'node:fs';

// Allow encapsulation to be broken in the logger. It's better injecting it everywhere
const logFile = 'debug.log';
let enabled;

function log(message) {
  if (!enabled) return;
  const timestamp = new Date().toISOString();
  appendFileSync(logFile, `${timestamp} ${message}\n`);
}

export default log;

export function configure(options) {
  enabled = options.enabled || false;
}
