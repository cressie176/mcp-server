import FileSystem from './repositories/FileSystem.js';
import GitHub from './repositories/GitHub.js';

class RepositoryFactory {
  static create(args) {
    const repositoryType = args.get('repository-type');

    switch (repositoryType) {
      case 'filesystem': {
        return new FileSystem(args.filter(['path']));
      }
      case 'github': {
        return new GitHub(args.filter(['user', 'organisation', 'repository', 'ref', 'path']));
      }
      default:
        throw new Error(`Unknown repository type: ${repositoryType}. Valid types are: filesystem, github`);
    }
  }
}

export default RepositoryFactory;
