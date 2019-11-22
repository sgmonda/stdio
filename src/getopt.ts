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

interface ParsingState {
  activeOption: string;
  remainingArgs: number;
  optionArgs: string[];
}

function getShorteners(options: Options): { [key: string]: string } {
  const initialValue: { [key: string]: string } = {};
  return Object.entries(options).reduce((accum, [key, value]) => {
    if (typeof value === 'object' && value.key) accum[value.key] = key;
    return accum;
  }, initialValue);
}

function parseOption(options: Options, arg: string): string[] | null {
  if (!/^--?[a-zA-Z]/.test(arg)) return null;
  if (arg.startsWith('--')) {
    return [arg.replace(/^--/, '')];
  }
  const shorteners = getShorteners(options);
  return arg
    .replace(/^-/, '')
    .split('')
    .map(letter => shorteners[letter] || letter);
}

function getStateAndReset(state: ParsingState): { [key: string]: string[] } {
  const partial = { [state.activeOption]: state.optionArgs };
  Object.assign(state, {
    activeOption: '',
    remainingArgs: 0,
    optionArgs: [],
  });
  return partial;
}

function postprocess(input: GetoptResponse): GetoptResponse {
  const initialValue: GetoptResponse = {};
  return Object.entries(input).reduce((accum, [key, value]) => {
    if (Array.isArray(value) && value.length === 1) accum[key] = value[0];
    else accum[key] = value;
    return accum;
  }, initialValue);
}

function getopt(options: Options = {}, command: string[]): GetoptResponse {
  const rawArgs = command.slice(2);
  if (!rawArgs.length) return {};
  const result: GetoptResponse = {};
  const args: string[] = [];
  const state: ParsingState = {
    activeOption: '',
    remainingArgs: 0,
    optionArgs: [],
  };
  rawArgs.forEach(arg => {
    const parsedOption = parseOption(options, arg);
    if (!parsedOption) {
      if (state.activeOption) {
        state.optionArgs.push(arg);
        state.remainingArgs--;
        if (!state.remainingArgs) Object.assign(result, getStateAndReset(state));
      } else args.push(arg);
      return;
    }
    parsedOption.forEach(option => {
      let forcedValue = null;
      if (option.includes('=')) {
        const parts = option.split('=');
        option = parts[0];
        forcedValue = parts[1];
      }
      if (!options[option]) {
        throw new Error(`Unrecognized option: ${arg}`);
      }
      if (!options[option]!.args) {
        result[option] = true;
        return;
      }
      if (state.activeOption) {
        Object.assign(result, getStateAndReset(state));
      }
      Object.assign(state, {
        activeOption: option,
        remainingArgs: options[option]!.args || 0,
        optionArgs: forcedValue ? [forcedValue] : [],
      });
      result[option] = true;
    });
  });
  if (args.length) result.args = args;
  return postprocess(result);
}

export default (options: Options, command: string[] = process.argv): GetoptResponse | null => {
  try {
    return getopt(options, command);
  } catch (error) {
    console.log(error);
    process.exit(FAILURE);
    return null;
  }
};
