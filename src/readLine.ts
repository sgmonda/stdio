import { createInterface, ReadLine } from 'readline';

class InputStream {
  private reader: ReadLine;
  private buffer: string[];
  private handlers: Array<Function>;

  constructor(input: NodeJS.ReadableStream = process.stdin) {
    this.reader = createInterface({ input });
    this.buffer = [];
    this.handlers = [];
    this.reader.on('line', (line: string) => {
      if (this.handlers.length > 0) {
        const resolver = this.handlers.shift();
        if (resolver) resolver(line);
      } else {
        this.buffer.push(line);
      }
    });
    this.reader.on('close', () => {
      if (this.handlers.length > 0) {
        const resolver = this.handlers.shift();
        if (resolver) resolver(null);
      }
    });
  }

  public async getLine(): Promise<string> {
    return new Promise(resolve => {
      if (this.buffer.length > 0) {
        this.reader.pause();
        return resolve(this.buffer.shift());
      }
      this.reader.resume();
      this.handlers.push(resolve);
    });
  }

  public close(): void {
    this.reader.close();
  }
}

let input: InputStream | null = null;

export interface Options {
  stream?: NodeJS.ReadableStream;
  close?: boolean;
}

export default function(options: Options = {}): Promise<string> {
  input = input || new InputStream(options.stream);
  const line = input.getLine();
  if (options.close) input.close();
  return line;
}
