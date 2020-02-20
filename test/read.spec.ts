import { read } from '../index';
import { ReadableString } from '../src/modules';

function getReadStream(str: string): NodeJS.ReadableStream {
  return new ReadableString(str);
}

test('Basic line handler', async () => {
  const input = 'hello\nbye\nother\nlast\n\n'.repeat(5000) + 'eof';
  const observed: string[] = [];
  const handler = async (line: string, index: number): Promise<number> => observed.push(`#${index} ${line}`);
  const result = await read(handler, getReadStream(input));
  expect(result).toHaveProperty('length');
  expect(result).toHaveProperty('timeAverage');
  expect(result).toHaveProperty('times');
  const expected = input.split('\n').map((line, index) => `#${index} ${line}`);
  expect(observed).toEqual(expected);
});
