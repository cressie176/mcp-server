#!/usr/bin/env node

import process from 'node:process';
import Arguments from './src/Arguments.js';
import RepositoryFactory from './src/RepositoryFactory.js';
import Server from './src/Server.js';
import { configure as configureLogging } from './src/log.js';

const args = new Arguments(process.argv.slice(2));
configureLogging({ enabled: args.get('debug') });

const repository = RepositoryFactory.create(args);
const server = new Server({ repository });

process.on('SIGINT', interrupt);
process.on('SIGTERM', interrupt);

await server.start();

async function interrupt() {
  process.off('SIGINT', interrupt);
  process.off('SIGTERM', interrupt);
  await server.stop();
}
