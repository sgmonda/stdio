import { createInterface, ReadLine } from 'readline';

const NOW = () => new Date().getTime();

export interface Stats {
  length: number;
  times: Array<number>;
  timeAverage: number;
}

export interface State {
  buffer: Array<string>;
  isOpen: boolean;
  stats: Stats;
  reader: ReadLine;
  resolve: Function;
  reject: Function;
  lineHandler: Function;
  index: number;
}

function compileStats(stats: Stats) {
  const timeSum = stats.times.reduce((accum: number, time: number) => accum + time, 0);
  stats.timeAverage = timeSum / stats.times.length;
  return stats;
}

function processNextLine(state: State) {
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
    if (!buffer.length) reader.resume();
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

export default (lineHandler: Function) =>
  new Promise((resolve, reject) => {
    const reader = createInterface({ input: process.stdin });
    const state: State = {
      buffer: [],
      index: 0,
      isOpen: true,
      stats: { length: 0, times: [], timeAverage: 0 },
      resolve,
      reject,
      reader,
      lineHandler,
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
