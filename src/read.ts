import { createInterface, ReadLine } from 'readline';

const NOW = (): number => new Date().getTime();

export type LineHandler = (line: string, index: number) => Promise<any>;

export interface Stats {
  length: number;
  times: number[];
  timeAverage: number;
}

export interface State {
  buffer: string[];
  isOpen: boolean;
  stats: Stats;
  reader: ReadLine;
  resolve: Function;
  reject: Function;
  lineHandler: LineHandler;
  index: number;
}

function compileStats(stats: Stats): Stats {
  const timeSum = stats.times.reduce((accum: number, time: number) => accum + time, 0);
  stats.timeAverage = timeSum / stats.times.length;
  return stats;
}

function getSuccessCallback(state: State, startTime: number, callback: (...args: any[]) => void): () => void {
  const { buffer, isOpen, stats, reader, resolve } = state;
  return (): void => {
    stats.times.push(NOW() - startTime);
    if (!isOpen && !buffer.length) {
      resolve(compileStats(stats));
      return;
    }
    if (!buffer.length) {
      reader.resume();
    }
    setImmediate(callback);
  };
}

function getErrorCallback(reader: ReadLine, reject: Function): (error: Error) => void {
  return (error: Error): void => {
    reader.close();
    reject(error);
  };
}

function processNextLine(state: State): void {
  const { buffer, reader, reject, lineHandler } = state;
  const line = buffer.shift();
  if (typeof line !== 'string') {
    setImmediate(() => processNextLine(state));
    return;
  }
  const onSuccess = getSuccessCallback(state, NOW(), () => processNextLine(state));
  const onError = getErrorCallback(reader, reject);
  lineHandler(line, state.index++)
    .then(onSuccess)
    .catch(onError);
}

export default (lineHandler: LineHandler, input: NodeJS.ReadableStream = process.stdin): Promise<void> =>
  new Promise((resolve, reject): void => {
    const reader = createInterface({ input });
    const state: State = {
      buffer: [],
      index: 0,
      isOpen: true,
      lineHandler,
      reader,
      reject,
      resolve,
      stats: { length: 0, times: [], timeAverage: 0 },
    };
    reader.on('close', () => {
      state.isOpen = false;
    });
    reader.on('line', (line: string) => {
      state.stats.length++;
      reader.pause();
      state.buffer.push(line);
    });
    setImmediate(() => processNextLine(state));
  });
