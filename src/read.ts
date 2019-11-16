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

function processNextLine(state: State): void {
  const { buffer, isOpen, stats, reader, resolve, reject, lineHandler } = state;
  const startTime = NOW();
  const line = buffer.shift();
  if (typeof line !== 'string') {
    setImmediate(processNextLine);
    return;
  }

  function onSuccess(): void {
    stats.times.push(NOW() - startTime);
    if (!isOpen && !buffer.length) {
      resolve(compileStats(stats));
      return;
    }
    if (!buffer.length) {
      reader.resume();
    }
    setImmediate(() => processNextLine(state));
  }

  function onError(error: Error): void {
    reader.close();
    reject(error);
  }

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
