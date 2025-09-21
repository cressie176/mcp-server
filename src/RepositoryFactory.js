import FileSystem from './repositories/FileSystem.js';
import GitHub from './repositories/GitHub.js';

class RepositoryFactory {
  static #repositories = new Map([
    ['filesystem', (args) => new FileSystem(args.filter(['path']))],
    ['github', (args) => new GitHub(args.filter(['user', 'organisation', 'repository', 'ref', 'path']))],
  ]);

  static create(args) {
    const repositoryType = args.get('repository-type');
    const factory = RepositoryFactory.#getFactory(repositoryType);
    return factory(args);
  }

  static #getFactory(repositoryType) {
    const factory = RepositoryFactory.#repositories.get(repositoryType);
    if (!factory) throw new Error(`Unknown repository type: ${repositoryType}`);
    return factory;
  }
}

export default RepositoryFactory;
