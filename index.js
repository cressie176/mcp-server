#!/usr/bin/env node

import process from 'node:process';
import mri from 'mri';
import Server from './src/Server.js';
import GitHub from './src/GitHub.js';
import Arguments from './src/Arguments.js';

const args = new Arguments(process.argv.slice(2));
const repository = new GitHub(args.filter(['user', 'organisation', 'repository', 'ref', 'path']));
const server = new Server({ repository });

process.on('SIGINT', interrupt);
process.on('SIGTERM', interrupt);

await server.start();

async function interrupt() {
  process.off('SIGINT', interrupt);
  process.off('SIGTERM', interrupt);
  await server.stop();
}

function parseArgs(allowed) {
  const all = mri(process.argv.slice(2));
  return allowed.reduce((name, args) => {
    return all[name] ? { ...args, [name]: all[name] } : args
  }, {})
}
