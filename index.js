#!/usr/bin/env node

import process from 'node:process';
import Server from './src/Server.js';

const server = new Server();

process.on('SIGINT', interupt);
process.on('SIGTERM', interupt);

await server.start();

async function interupt() {
  process.off('SIGINT', interupt);
  process.off('SIGTERM', interupt);
  await server.stop();
}
