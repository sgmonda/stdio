const FAILURE = 1;
const POSITIONAL_ARGS_KEY = 'args';
const ERROR_PREFFIX = 'ERROR#GETOPT: ';

export interface Config {
  [key: string]:
    | {
        key?: string;
        description?: string;
        multiple?: boolean;
        args?: number | string;
        mandatory?: boolean; // @deprecated
        required?: boolean;
        default?: string | string[] | boolean;
        maxArgs?: number;
        minArgs?: number;
      }
    | boolean
    | undefined;
}

export interface Options {
  exitOnFailure?: boolean;
  throwOnFailure?: boolean;
  printOnFailure?: boolean;
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

function throwError(message: string): void {
  throw new Error(ERROR_PREFFIX + message);
}

function getShorteners(options: Config): { [key: string]: string } {
  const initialValue: { [key: string]: string } = {};
  return Object.entries(options).reduce((accum, [key, value]) => {
    if (typeof value === 'object' && value.key) accum[value.key] = key;
    return accum;
  }, initialValue);
}

function parseOption(config: Config, arg: string): string[] | null {
  if (!/^--?[a-zA-Z]/.test(arg)) return null;
  if (arg.startsWith('--')) {
    return [arg.replace(/^--/, '')];
  }
  const shorteners = getShorteners(config);
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
  return Object.entries(input).reduce((accum, [key, value]) => {
    if (Array.isArray(value) && value.length === 1 && key !== POSITIONAL_ARGS_KEY) accum[key] = value[0];
    else accum[key] = [...value];
    return accum;
  }, initialValue);
}

function checkRequiredParams(config: Config, input: GetoptPartialResponse): void {
  if (config._meta_ && typeof config._meta_ === 'object') {
    const { args = 0, minArgs = 0, maxArgs = 0 } = config._meta_;

    let providedArgs = 0;
    let error = null;
    if (Array.isArray(input[POSITIONAL_ARGS_KEY]) && input[POSITIONAL_ARGS_KEY].length > 0) {
      providedArgs = input[POSITIONAL_ARGS_KEY].length;
    }
    if (args && providedArgs !== args) {
      error = `${args} positional arguments are required, but ${providedArgs} were provided`;
    }
    if (minArgs && providedArgs < minArgs) {
      error = `At least ${minArgs} positional arguments are required, but ${providedArgs} were provided`;
    }
    if (maxArgs && providedArgs > maxArgs) {
      error = `Max allowed positional arguments is ${maxArgs}, but ${providedArgs} were provided`;
    }
    if (error) throwError(error);
  }
  Object.entries(config).forEach(([key, value]) => {
    if (!value || typeof value !== 'object') return;
    if ((value.mandatory || value.required) && !input[key]) {
      throwError(`Missing option: "--${key}"`);
    }
    if (value.args && value.args !== '*') {
      const expectedArgsCount = parseInt(String(value.args));
      const argsCount = input[key] ? input[key].length : 0;
      if (expectedArgsCount > 0 && expectedArgsCount !== argsCount) {
        throwError(`Option "--${key}" requires ${expectedArgsCount} arguments, but ${argsCount} were provided`);
      }
    }
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
      if (['h', 'help'].includes(option)) throwError('');
      let subconfig = config[option];
      if (!subconfig) {
        throwError(`Unknown option: "${arg}"`);
        return;
      }
      if (typeof subconfig === 'boolean') subconfig = {};
      const isMultiple = !!subconfig.multiple;
      if (result[option] && !isMultiple) throwError(`Option "--${option}" provided many times`);
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
        optionArgs: [],
        isMultiple,
      });
      if (!isMultiple) result[option] = [true];
    });
  });
  if (args.length) result[POSITIONAL_ARGS_KEY] = args;
  applyDefaults(config, result);
  checkRequiredParams(config, result);
  return postprocess(result);
}

function getHelpMessage(config: Config, programName: string): string {
  const strLines = [
    'USAGE: node ' + programName + ' [OPTION1] [OPTION2]... arg1 arg2...',
    'The following options are supported:',
  ];

  const lines: string[][] = [];

  Object.entries(config).forEach(([key, value]) => {
    if (key === '_meta_') return;
    if (typeof value !== 'object' || !value) {
      lines.push(['  --' + key, '']);
      return;
    }
    let ops = ' ';

    if (value.multiple) value.args = 1;
    const argsCount = value.args || 0;

    if (value.args === '*') {
      ops += '<ARG1>...<ARGN>';
    } else {
      for (let i = 0; i < argsCount; i++) {
        ops += '<ARG' + (i + 1) + '> ';
      }
    }
    lines.push([
      '  ' + (value.key ? '-' + value.key + ', --' : '--') + key + ops,
      (value.description || '') +
        (value.mandatory || value.required ? ' (required)' : '') +
        (value.multiple ? ' (multiple)' : '') +
        (value.default ? ' ("' + value.default + '" by default)' : ''),
    ]);
  });

  const maxLength = lines.reduce((prev, current) => Math.max(current[0].length, prev), 0);
  const plainLines = lines.map(line => {
    const key = line[0];
    const message = line[1];
    const padding = new Array(maxLength - key.length + 1).join(' ');
    return (key + padding + '\t' + message).trimRight();
  });

  return strLines.concat(plainLines).join('\n');
}

function preprocessCommand(command: string[]): string[] {
  const parsed: string[] = [];
  command.forEach(item => {
    if (/^--?[a-zA-Z]+=/.test(item)) {
      const part1 = item.split('=')[0];
      const part2 = item.replace(part1 + '=', '');
      parsed.push(part1);
      parsed.push(part2);
    } else {
      parsed.push(item);
    }
  });
  return parsed;
}

function checkConfig(config: Config): void {
  if (config.help) throw new Error('"--help" option is reserved and cannot be declared in a getopt() call');
  Object.values(config).forEach(value => {
    if (!value || typeof value !== 'object') {
      console.warn(
        'Boolean description of getopt() options is deprecated and will be ' +
          'removed in a future "stdio" release. Please, use an object definitions instead.',
      );
      return;
    }
    if (value.key === 'h') throw new Error('"-h" option is reserved and cannot be declared in a getopt() call');
    if (value.mandatory)
      console.warn(
        '"mandatory" option is deprecated and will be removed in a ' +
          'future "stdio" release. Please, use "required" instead.',
      );
  });
}

export default (config: Config, command: string[] = process.argv, options?: Options): GetoptResponse | null => {
  const { exitOnFailure = true, throwOnFailure = false, printOnFailure = true } = options || {};
  try {
    checkConfig(config);
    return getopt(config, preprocessCommand(command));
  } catch (error) {
    if (!error.message.startsWith(ERROR_PREFFIX)) {
      throw error;
    }
    const programName = command[1].split('/').pop() || 'program';
    const message = (error.message.replace(ERROR_PREFFIX, '') + '\n' + getHelpMessage(config, programName)).trim();
    if (printOnFailure) console.warn(message);
    if (exitOnFailure) process.exit(FAILURE);
    if (throwOnFailure) throw new Error(message);
    return null;
  }
};
