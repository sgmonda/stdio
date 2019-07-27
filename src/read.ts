import { createInterface, ReadLine } from 'readline';

const NOW = () => new Date().getTime();

export type ILineHandler = (line: string, index: number) => Promise<any>;

export interface IStats {
  length: number;
  times: number[];
  timeAverage: number;
}

export interface IState {
  buffer: string[];
  isOpen: boolean;
  stats: IStats;
  reader: ReadLine;
  resolve: (stats: IStats) => any;
  reject: (error: Error) => any;
  lineHandler: ILineHandler;
  index: number;
}

function compileStats(stats: IStats) {
  const timeSum = stats.times.reduce((accum: number, time: number) => accum + time, 0);
  stats.timeAverage = timeSum / stats.times.length;
  return stats;
}

function processNextLine(state: IState) {
  const { buffer, isOpen, stats, reader, resolve, reject, lineHandler } = state;
  const startTime = NOW();
  const line = buffer.shift();
  if (typeof line !== 'string') {
    return setImmediate(processNextLine);
  }

  function onSuccess() {
    stats.times.push(NOW() - startTime);
    if (!isOpen && !buffer.length) {
      return resolve(compileStats(stats));
    }
    if (!buffer.length) {
      reader.resume();
    }
    return setImmediate(() => processNextLine(state));
  }

  function onError(error: Error) {
    reader.close();
    reject(error);
  }

  lineHandler(line, state.index++)
    .then(onSuccess)
    .catch(onError);
}

export default (lineHandler: ILineHandler) =>
  new Promise((resolve, reject) => {
    const reader = createInterface({ input: process.stdin });
    const state: IState = {
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
