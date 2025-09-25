import { deepEqual, strictEqual as eq } from 'node:assert';
import { describe, it } from 'node:test';
import Arguments from '../src/Arguments.js';

describe('Arguments', () => {
  describe('retrieval', () => {
    it('retrieves basic arguments', () => {
      const args = new Arguments(['--name', 'test', '--port', '3000']);
      eq(args.get('name'), 'test');
      eq(args.get('port'), 3000);
    });

    it('retrieves boolean flags', () => {
      const args = new Arguments(['--verbose', '--debug']);
      eq(args.get('verbose'), true);
      eq(args.get('debug'), true);
    });

    it('returns undefined for missing arguments', () => {
      const args = new Arguments(['--name', 'test']);
      eq(args.get('nonexistent'), undefined);
    });
  });

  describe('filtering', () => {
    it('includes permitted arguments', () => {
      const args = new Arguments(['--name', 'test', '--port', '3000', '--verbose']);
      const filtered = args.filter(['name', 'port']);
      deepEqual(filtered, { name: 'test', port: '3000' });
    });

    it('excludes other arguments', () => {
      const args = new Arguments(['--name', 'test', '--port', '3000', '--verbose']);
      const filtered = args.filter(['name']);
      deepEqual(filtered, { name: 'test' });
    });
  });

  describe('aliases', () => {
    it('aliases repositoryType with repository-type', () => {
      const args = new Arguments(['--repository-type', 'github']);
      eq(args.get('repositoryType'), 'github');
      eq(args.get('repository-type'), 'github');
    });

    it('aliases logLevel with log-level', () => {
      const args = new Arguments(['--log-level', 'debug']);
      eq(args.get('logLevel'), 'debug');
      eq(args.get('log-level'), 'debug');
    });

    it('aliases logFile with log-file', () => {
      const args = new Arguments(['--log-file', 'app.log']);
      eq(args.get('logFile'), 'app.log');
      eq(args.get('log-file'), 'app.log');
    });

    it('aliases user with organisation', () => {
      const args = new Arguments(['--organisation', 'myorg']);
      eq(args.get('user'), 'myorg');
      eq(args.get('organisation'), 'myorg');
    });

    it('filters with aliased arguments', () => {
      const args = new Arguments(['--repository-type', 'github', '--log-level', 'debug', '--name', 'test']);
      const filtered = args.filter(['repositoryType', 'logLevel']);
      deepEqual(filtered, { repositoryType: 'github', logLevel: 'debug' });
    });

    it('prefers canonical arguments to aliases', () => {
      const args = new Arguments(['--user', 'cressie176', '--organisation', 'acuminous']);
      eq(args.get('user'), 'cressie176');
      eq(args.get('organisation'), 'cressie176');
    });
  });
});
