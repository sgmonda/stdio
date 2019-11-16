import { Readable } from 'stream';
import { read } from '../index';

class ReadableString extends Readable {
  private sent = false;
  constructor(private str: string) {
    super();
  }
  public _read(): null {
    if (!this.sent) {
      this.push(Buffer.from(this.str));
      this.sent = true;
    } else {
      this.push(null);
    }
  }
}

function getReadStream(str: string): NodeJS.ReadableStream {
  return new ReadableString(str);
}

test('Basic line handler', async () => {
  const input = 'hello\nbye\nother\nlast\n\n'.repeat(5000) + 'eof';
  const observed: string[] = [];
  const handler = async (line: string, index: number): null => observed.push(`#${index} ${line}`);
  const result = await read(handler, getReadStream(input));
  expect(result).toHaveProperty('length');
  expect(result).toHaveProperty('timeAverage');
  expect(result).toHaveProperty('times');
  const expected = input.split('\n').map((line, index) => `#${index} ${line}`);
  expect(observed).toEqual(expected);
});
