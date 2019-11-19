const FAILURE = 1;

export interface Options {
  [key: string]:
    | {
        key?: string;
        description?: string;
        multiple?: boolean;
        args?: number | string;
        mandatory?: boolean;
      }
    | undefined;
}

export interface GetoptResponse {
  [key: string]: string | number | string[] | number[] | boolean;
}

function getShorteners(options: Options): { [key: string]: string } {
  const initialValue: { [key: string]: string } = {};
  return Object.entries(options).reduce((accum, [key, value]) => {
    if (typeof value === 'object' && value.key) accum[value.key] = key;
    return accum;
  }, initialValue);
}

function parseOption(options: Options, arg: string): string | null {
  if (!/^--?/.test(arg)) return null;
  const shorteners = getShorteners(options);
  arg = arg.replace(/^--?/, '');
  if (shorteners[arg]) arg = shorteners[arg];
  return arg;
}

function getopt(options: Options = {}, command: string[]): GetoptResponse {
  const rawArgs = command.slice(2);
  if (!rawArgs.length) return {};
  const result: GetoptResponse = {};
  const args: string[] = [];
  const state: { activeOption: string; remainingArgs: number; optionArgs: string[] } = {
    activeOption: '',
    remainingArgs: 0,
    optionArgs: [],
  };
  rawArgs.forEach(arg => {
    const option = parseOption(options, arg);
    if (!option) {
      if (state.activeOption) {
        state.optionArgs.push(arg);
        state.remainingArgs--;

        if (!state.remainingArgs) {
          result[state.activeOption] = state.optionArgs;
          Object.assign(state, {
            activeOption: '',
            remainingArgs: 0,
            optionArgs: [],
          });
        }
      } else args.push(arg);
      return;
    }
    if (!options[option]) {
      throw new Error(`Unrecognized option: ${arg}`);
    }

    if (state.activeOption) {
      if (state.remainingArgs)
        throw new Error(
          `Option ${state.activeOption} requires ${options[option]!.args} arguments. But ${
            state.optionArgs
          } were provided`,
        );
      result[state.activeOption] = state.optionArgs;
      Object.assign(state, {
        activeOption: '',
        remainingArgs: 0,
        optionArgs: [],
      });
    }

    Object.assign(state, {
      activeOption: option,
      remainingArgs: options[option]!.args || 0,
      optionArgs: [],
    });
    result[option] = true;
  });
  if (args.length) result.args = args;
  return result;
}

export default (options: Options, command: string[] = process.argv): GetoptResponse => {
  try {
    return getopt(options, command);
  } catch (error) {
    console.log(error);
    process.exit(FAILURE);
  }
};
