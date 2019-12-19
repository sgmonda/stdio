const DEFAULT_TERMINAL_WIDTH = process.stdout.columns || 70;

function formatTime(msec: number): string {
  const dd = Math.floor(msec / 1000 / 60 / 60 / 24);
  msec -= dd * 1000 * 60 * 60 * 24;
  const hh = Math.floor(msec / 1000 / 60 / 60);
  msec -= hh * 1000 * 60 * 60;
  const mm = Math.floor(msec / 1000 / 60);
  msec -= mm * 1000 * 60;
  const ss = Math.floor(msec / 1000);
  msec -= ss * 1000;
  const str = [`0${hh}`.slice(-2), `0${mm}`.slice(-2), `0${ss}`.slice(-2)].join(':');
  return dd ? `${dd} días` : str;
}

function getStateInfo(
  size: number,
  value: number,
  ellapsedTime: number,
  remainingTime: number,
): { prefix: string; suffix: string; percent: number } {
  const ellapsed = formatTime(ellapsedTime);
  const percent = Math.floor((value * 100) / size);
  const eta = formatTime(value >= size ? 0 : remainingTime);
  return {
    prefix: ellapsed + ' ' + percent + '% [',
    suffix: '] ETA ' + eta,
    percent,
  };
}

class ProgressBar {
  size: number;
  tickSize: number;
  value: number;
  startTime: number;
  lastRemainingTimes: number[];
  silent: boolean;
  terminalWidth: number;
  callback: Function;

  constructor(size = 100, { tickSize = 1, silent = false, terminalWidth = DEFAULT_TERMINAL_WIDTH } = {}) {
    this.size = size;
    this.tickSize = tickSize;
    this.value = 0;
    this.startTime = Date.now();
    this.lastRemainingTimes = [];
    this.silent = silent;
    this.terminalWidth = terminalWidth;
    this.callback = (): void => {};
  }

  getEllapsed(): number {
    const milliseconds: number = Date.now() - this.startTime;
    return milliseconds;
  }

  getRemaining(): number {
    const secondsPerTick = this.getEllapsed() / this.value;
    const remaining = Math.floor((this.size - this.value) * secondsPerTick);
    this.lastRemainingTimes.push(remaining);
    if (this.lastRemainingTimes.length > 5) this.lastRemainingTimes.shift();
    const sum = this.lastRemainingTimes.reduce((accum, num) => accum + num, 0);
    return Math.floor(sum / this.lastRemainingTimes.length);
  }

  setValue(value: number): string {
    this.value = Math.min(value, this.size);
    const str = this.print();
    if (this.value === this.size) {
      if (!this.silent) process.stdout.write('\n');
      if (this.callback) this.callback();
      this.callback = (): void => {};
    }
    return str;
  }

  tick(): string {
    return this.setValue(this.value + this.tickSize);
  }

  onFinish(callback: Function): void {
    this.callback = callback;
  }

  print(): string {
    const { prefix, suffix, percent } = getStateInfo(this.size, this.value, this.getEllapsed(), this.getRemaining());

    if (!this.silent) process.stdout.write('\r');
    const width = this.terminalWidth - suffix.length - prefix.length;
    const ticks = [];

    for (let i = 0, len = width; i < len; i++) {
      if ((i * 100) / len <= percent) {
        ticks.push('#');
      } else {
        ticks.push('·');
      }
    }
    const str = prefix + ticks.join('') + suffix;
    if (!this.silent) process.stdout.write(str);
    return str;
  }
}

export default ProgressBar;
