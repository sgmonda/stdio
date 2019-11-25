const FAILURE = 1;
const POSITIONAL_ARGS_KEY = 'args';

export interface Config {
  [key: string]:
    | {
        key?: string;
        description?: string;
        multiple?: boolean;
        args?: number | string;
        mandatory?: boolean;
        required?: boolean;
      }
    | boolean
    | undefined;
}

export interface GetoptPartialResponse {
  [key: string]: Array<string | boolean>;
}

export interface GetoptResponse {
  [key: string]: string | number | boolean | Array<string | number | boolean>;
}

interface ParsingState {
  activeOption: string;
  remainingArgs: number;
  optionArgs: string[];
}

function getShorteners(options: Config): { [key: string]: string } {
  const initialValue: { [key: string]: string } = {};
  return Object.entries(options).reduce((accum, [key, value]) => {
    if (typeof value === 'object' && value.key) accum[value.key] = key;
    return accum;
  }, initialValue);
}

function parseOption(options: Config, arg: string): string[] | null {
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

function postprocess(input: GetoptPartialResponse): GetoptResponse {
  const initialValue: GetoptResponse = {};
  const result = Object.entries(input).reduce((accum, [key, value]) => {
    if (Array.isArray(value) && value.length === 1 && key !== POSITIONAL_ARGS_KEY) accum[key] = value[0];
    else accum[key] = [...value];
    return accum;
  }, initialValue);
  return result;
}

function checkRequiredParams(config: Config, input: GetoptResponse): void {
  Object.entries(config)
    .filter(([, value]) => value && typeof value !== 'boolean' && (value.mandatory || value.required))
    .forEach(([key]) => {
      if (!input[key]) throw new Error(`Missing parameter: ${key}`);
    });
}

function getopt(config: Config = {}, command: string[]): GetoptResponse {
  const rawArgs = command.slice(2);
  if (!rawArgs.length) return {};
  const result: GetoptPartialResponse = {};
  const args: string[] = [];
  const state: ParsingState = {
    activeOption: '',
    remainingArgs: 0,
    optionArgs: [],
  };
  rawArgs.forEach(arg => {
    const parsedOption = parseOption(config, arg);
    if (!parsedOption) {
      if (state.activeOption) {
        state.optionArgs.push(arg);
        state.remainingArgs--;
        if (!state.remainingArgs) Object.assign(result, getStateAndReset(state));
      } else {
        args.push(arg);
      }
      return;
    }
    parsedOption.forEach(option => {
      let forcedValue = null;
      if (option.includes('=')) {
        const parts = option.split('=');
        option = parts[0];
        forcedValue = parts.slice(1).join('=');
      }
      let subconfig = config[option];
      if (!subconfig) {
        throw new Error(`Unrecognized option: ${arg}`);
      }
      if (typeof subconfig === 'boolean') subconfig = {};
      let expectedArgsCount = subconfig!.args;
      if (expectedArgsCount === '*') expectedArgsCount = Infinity;

      if (state.activeOption) {
        Object.assign(result, getStateAndReset(state));
      }

      if (!expectedArgsCount) {
        result[option] = [true];
        return;
      }

      Object.assign(state, {
        activeOption: option,
        remainingArgs: expectedArgsCount || 0,
        optionArgs: forcedValue ? [forcedValue] : [],
      });
      result[option] = [true];
    });
  });
  if (args.length) result[POSITIONAL_ARGS_KEY] = args;
  const compiledResult = postprocess(result);
  checkRequiredParams(config, compiledResult);
  return compiledResult;
}

interface Options {
  exitOnFailure: boolean;
}

export default (config: Config, command: string[] = process.argv, options?: Options): GetoptResponse | null => {
  const { exitOnFailure = true } = options || {};
  try {
    return getopt(config, command);
  } catch (error) {
    if (!exitOnFailure) return null;
    console.log(error); // @TODO Print help
    process.exit(FAILURE);
    return null;
  }
};
