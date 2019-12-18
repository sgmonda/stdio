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

class ProgressBar {
  size: number;
  tickSize: number;
  value: number;
  startTime: number;
  lastRemainingTimes: number[];
  callback: Function;

  constructor(size = 100, tickSize = 1) {
    this.size = size;
    this.tickSize = tickSize;
    this.value = 0;
    this.startTime = Date.now();
    this.lastRemainingTimes = [];
    this.callback = (): void => {};
  }

  getEllapsedTime(): number {
    const milliseconds: number = Date.now() - this.startTime;
    return milliseconds;
  }

  getRemainingTime(): number {
    const secondsPerTick = this.getEllapsedTime() / this.value;
    const remaining = Math.floor((this.size - this.value) * secondsPerTick);
    this.lastRemainingTimes.push(remaining);
    if (this.lastRemainingTimes.length > 5) this.lastRemainingTimes.shift();
    const sum = this.lastRemainingTimes.reduce((accum, num) => accum + num, 0);
    return Math.floor(sum / this.lastRemainingTimes.length);
  }

  setValue(value: number): void {
    this.value = Math.min(value, this.size);
    this.print();
    if (this.value === this.size) {
      process.stdout.write('\n');
      if (this.callback) this.callback();
      this.callback = (): void => {};
    }
  }

  tick(): void {
    this.setValue(this.value + 1);
  }

  onFinish(callback: Function): void {
    this.callback = callback;
  }

  print(): void {
    const ellapsedTime = formatTime(this.getEllapsedTime());
    const percent = Math.floor((this.value * 100) / this.size);
    const prefix = ellapsedTime + ' ' + percent + '% [';

    const eta = formatTime(this.value >= this.size ? 0 : this.getRemainingTime());
    const suffix = '] ETA ' + eta;

    process.stdout.write('\r');
    const terminalWidth = process.stdout.columns || 70;
    const width = terminalWidth - suffix.length - prefix.length;
    const ticks = [];

    for (let i = 0, len = width; i < len; i++) {
      if ((i * 100) / len <= percent) {
        ticks.push('#');
      } else {
        ticks.push('·');
      }
    }
    process.stdout.write(prefix + ticks.join('') + suffix);
  }
}

export default ProgressBar;
