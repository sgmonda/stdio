export interface GetoptDefinition {
  [key: string]: string | number;
}

export interface GetoptResponse {
  [key: string]: string | number | string[] | number[];
}

export default (definition: GetoptDefinition, command: string[] = process.argv): GetoptResponse => {
  console.log('COMMAND', command);
  return { a: 1, b: 2 };
};
