#!/usr/bin/env node

import process from 'node:process';
import Arguments from './src/Arguments.js';
import Logger from './src/Logger.js';
import RepositoryFactory from './src/RepositoryFactory.js';
import Server from './src/Server.js';

const args = new Arguments(process.argv.slice(2));

const repository = RepositoryFactory.create(args);
const server = new Server({ repository });

const logLevel = args.get('log-level');
const logFile = args.get('log-file');
const writeLog = Logger.createWriter(logLevel, logFile);

process.on('SIGINT', interrupt);
process.on('SIGTERM', interrupt);
process.on('LOG', writeLog);

await server.start();

async function interrupt() {
  process.off('SIGINT', interrupt);
  process.off('SIGTERM', interrupt);
  await server.stop();
}
