export interface Options {
  [key: string]:
    | {
        key?: string;
        description?: string;
        multiple?: boolean;
        args?: number | string;
        mandatory?: boolean;
      }
    | boolean;
}

export interface GetoptResponse {
  [key: string]: string | number | string[] | number[] | boolean;
}

export default (options: Options, command: string[] = process.argv): GetoptResponse => {
  console.log('COMMAND', command);
  return {};
};
