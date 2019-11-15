interface IDefinition {
  [key: string]: string | number;
}

export default (definition: IDefinition, command: string[] = process.argv) => {
  return { a: 1, b: 2 };
};
