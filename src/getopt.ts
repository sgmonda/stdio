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
        default?: string | string[] | boolean;
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
  isMultiple: boolean;
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

function getStateAndReset(state: ParsingState): { [key: string]: Array<string | boolean> } {
  const partial = { [state.activeOption]: state.optionArgs };
  Object.assign(state, {
    activeOption: '',
    remainingArgs: 0,
    optionArgs: [],
    isMultiple: false,
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

function applyDefaults(config: Config, result: GetoptPartialResponse): void {
  Object.entries(config).forEach(([key, value]) => {
    if (!value || typeof value !== 'object') return;
    if ('default' in value && !(key in result)) {
      const values = Array.isArray(value.default) ? value.default : [value.default];
      result[key] = values.map(v => (typeof v === 'boolean' ? v : String(v)));
    }
  });
}

function getopt(config: Config = {}, command: string[]): GetoptResponse {
  const rawArgs = command.slice(2);
  const result: GetoptPartialResponse = {};
  const args: string[] = [];
  const state: ParsingState = {
    activeOption: '',
    remainingArgs: 0,
    optionArgs: [],
    isMultiple: false,
  };
  rawArgs.forEach(arg => {
    const parsedOption = parseOption(config, arg);
    if (!parsedOption) {
      if (state.activeOption) {
        state.optionArgs.push(arg);
        state.remainingArgs--;
        if (!state.remainingArgs || state.isMultiple) {
          const isMultiple = state.isMultiple;
          const partial = getStateAndReset(state);
          Object.entries(partial).forEach(([key, value]) => {
            if (isMultiple && result[key]) partial[key] = result[key].concat(value);
          });
          Object.assign(result, partial);
        }
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
      const isMultiple = !!subconfig.multiple;
      if (result[option] && !isMultiple) throw new Error(`Option ${arg} provided many times`);
      let expectedArgsCount = subconfig!.args;
      if (expectedArgsCount === '*') expectedArgsCount = Infinity;

      if (state.activeOption) {
        const partial = getStateAndReset(state);
        Object.entries(partial).forEach(([key, value]) => {
          if (!result[key]) return;
          if (isMultiple) partial[key] = result[key].concat(value);
        });
        Object.assign(result, partial);
      }

      if (!expectedArgsCount && !isMultiple) {
        result[option] = [true];
        return;
      }

      Object.assign(state, {
        activeOption: option,
        remainingArgs: expectedArgsCount || 0,
        optionArgs: forcedValue ? [forcedValue] : [],
        isMultiple,
      });
      if (!isMultiple) result[option] = [true];
    });
  });
  if (args.length) result[POSITIONAL_ARGS_KEY] = args;
  applyDefaults(config, result);
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
