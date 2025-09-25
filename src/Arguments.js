import mri from 'mri';

class Arguments {
  #args;

  constructor(args) {
    this.#args = mri(args, {
      alias: {
        repositoryType: 'repository-type',
        logLevel: 'log-level',
        logFile: 'log-file',
        user: 'organisation',
      },
    });
  }

  // This method does not violate encapsulation.
  // The arguments class exists solely as a conduit for passing configuration to other parts of the application.
  get(name) {
    return this.#args[name];
  }

  filter(allowed) {
    return allowed.reduce((args, name) => {
      return this.#args[name] ? { ...args, [name]: this.#args[name] } : args;
    }, {});
  }
}

export default Arguments;
