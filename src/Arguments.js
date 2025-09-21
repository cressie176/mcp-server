import mri from 'mri';

class Arguments {
  #args;

  constructor(args, options = {}) {
    this.#args = mri(args, options);
  }

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
// test change
