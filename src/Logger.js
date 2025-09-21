import { appendFileSync } from 'node:fs';

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  OFF: 4,
};

class Logger {
  static debug(message, context) {
    process.emit('LOG', { level: 'DEBUG', message, context });
  }

  static info(message, context) {
    process.emit('LOG', { level: 'INFO', message, context });
  }

  static warn(message, context) {
    process.emit('LOG', { level: 'WARN', message, context });
  }

  static error(message, context) {
    process.emit('LOG', { level: 'ERROR', message, context });
  }

  static log(message, context) {
    process.emit('LOG', { level: 'INFO', message, context });
  }

  static createWriter(level, logFile = 'debug.log') {
    const threshold = LOG_LEVELS[level?.toUpperCase()] ?? LOG_LEVELS.OFF;
    return (record) => Logger.#writeRecord(record, threshold, logFile);
  }

  static #writeRecord(record, threshold, logFile) {
    const { level, message, context, timestamp = new Date().toISOString() } = record;
    if (LOG_LEVELS[level] < threshold) return;
    const output = Logger.#formatOutput(timestamp, level, message, context);
    Logger.#writeToFile(output, logFile);
  }

  static #formatOutput(timestamp, level, message, context) {
    return [timestamp, level, message, Logger.#formatContext(context)].filter(Boolean).join(' ');
  }

  static #formatContext(context) {
    if (!context) return;
    if (context instanceof Error) return `\n${context.message}\n${context.stack}`;
    if (typeof context === 'object') return `\n${JSON.stringify(context, null, 2)}`;
    return ` ${context}`;
  }

  static #writeToFile(output, logFile) {
    appendFileSync(logFile, `${output}\n`);
  }
}

export default Logger;
