import { readLine } from '../index';
import { ReadableString } from '../src/modules';

function getReadStream(str: string): NodeJS.ReadableStream {
  return new ReadableString(str);
}

test('Basic line reader', async () => {
  const text = 'hello\nbye\nother\nlast\n\n'.repeat(5000) + 'eof';
  const stream = getReadStream(text);
  const observed: string[] = [];
  let line = null;
  let index = 0;
  do {
    line = await readLine({ stream });
    observed.push(`#${index++} ${line}`);
  } while (line !== 'eof');
  const expected = text.split('\n').map((line, index) => `#${index} ${line}`);
  expect(observed).toEqual(expected);
});
