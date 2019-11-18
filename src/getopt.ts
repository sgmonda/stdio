export interface Options {
  [key: string]:
    | {
        key?: string;
        description?: string;
        multiple?: boolean;
        args?: number | string;
        mandatory?: boolean;
      }
    | boolean
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

export default (options: Options, command: string[] = process.argv): GetoptResponse => {
  const shorteners = getShorteners(options);

  const rawArgs = command.slice(2);
  if (!rawArgs.length) return {};
  const result: GetoptResponse = {};
  const args: string[] = [];
  rawArgs.forEach(arg => {
    if (arg.startsWith('--')) {
      arg = arg.replace(/^--/, '');
      result[arg] = true;
      return;
    } else if (arg.startsWith('-')) {
      arg = arg.replace(/^-/, '');
      if (shorteners[arg]) arg = shorteners[arg];
      result[arg] = true;
      return;
    }
    args.push(arg);
  });
  if (args.length) result.args = args;
  return result;
};
