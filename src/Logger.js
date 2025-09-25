import { appendFileSync } from 'node:fs';

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  OFF: 4,
};

export function debug(message, context) {
  process.emit('LOG', { level: 'DEBUG', message, context });
}

export function info(message, context) {
  process.emit('LOG', { level: 'INFO', message, context });
}

export function warn(message, context) {
  process.emit('LOG', { level: 'WARN', message, context });
}

export function error(message, context) {
  process.emit('LOG', { level: 'ERROR', message, context });
}

export const log = info;

export function createWriter(level, logFile = 'debug.log') {
  const threshold = LOG_LEVELS[level?.toUpperCase()] ?? LOG_LEVELS.ERROR;
  return (record) => writeRecord(record, threshold, logFile);
}

function writeRecord(record, threshold, logFile) {
  if (LOG_LEVELS[record.level] < threshold) return;
  const { level, message, context, timestamp = new Date().toISOString() } = record;
  const output = formatOutput(timestamp, level, message, context);
  writeToFile(output, logFile);
}

function formatOutput(timestamp, level, message, context) {
  return [timestamp, level, message, formatContext(context)].filter(Boolean).join(' ');
}

function formatContext(context) {
  if (!context) return;
  if (context instanceof Error) return `\n${context.message}\n${context.stack}`;
  if (typeof context === 'object') return `\n${JSON.stringify(context, null, 2)}`;
  return ` ${context}`;
}

function writeToFile(output, logFile) {
  appendFileSync(logFile, `${output}\n`);
}
