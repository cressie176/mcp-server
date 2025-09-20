#!/usr/bin/env node

import process from 'node:process';
import Server from './src/Server.js';

const server = new Server();

process.on('SIGINT', interrupt);
process.on('SIGTERM', interrupt);

await server.start();

async function interrupt() {
  process.off('SIGINT', interrupt);
  process.off('SIGTERM', interrupt);
  await server.stop();
}
