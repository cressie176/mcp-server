import process from 'node:process';
import AcmeMcpServer from './src/AcmeMcpServer.js';

const server = new AcmeMcpServer();

process.on('SIGINT', interupt);
process.on('SIGTERM', interupt);

await server.start();

async function interupt() {
  process.off('SIGINT', interupt);
  process.off('SIGTERM', interupt);
  await server.stop();
}
