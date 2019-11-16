import { createInterface, ReadLine } from 'readline';

const NOW = (): number => new Date().getTime();

export type LineHandler = (line: string, index: number) => Promise<null>;

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
  resolve: (stats: Stats) => null;
  reject: (error: Error) => null;
  lineHandler: LineHandler;
  index: number;
}

function compileStats(stats: Stats): Stats {
  const timeSum = stats.times.reduce((accum: number, time: number) => accum + time, 0);
  stats.timeAverage = timeSum / stats.times.length;
  return stats;
}

function processNextLine(state: State): null {
  const { buffer, isOpen, stats, reader, resolve, reject, lineHandler } = state;
  const startTime = NOW();
  const line = buffer.shift();
  if (typeof line !== 'string') {
    return setImmediate(processNextLine);
  }

  function onSuccess(): null {
    stats.times.push(NOW() - startTime);
    if (!isOpen && !buffer.length) {
      return resolve(compileStats(stats));
    }
    if (!buffer.length) {
      reader.resume();
    }
    return setImmediate(() => processNextLine(state));
  }

  function onError(error: Error): null {
    reader.close();
    reject(error);
  }

  lineHandler(line, state.index++)
    .then(onSuccess)
    .catch(onError);
}

export default (lineHandler: LineHandler, input: NodeJS.ReadableStream = process.stdin): null =>
  new Promise((resolve, reject) => {
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
