#!/usr/bin/env node

import process from 'node:process';
import Server from './src/Server.js';
import GitHub from './src/GitHub.js';

const [,, user, repository] = process.argv;
const github = new GitHub({ user, repository });
const server = new Server({ github });

process.on('SIGINT', interrupt);
process.on('SIGTERM', interrupt);

await server.start();

async function interrupt() {
  process.off('SIGINT', interrupt);
  process.off('SIGTERM', interrupt);
  await server.stop();
}
