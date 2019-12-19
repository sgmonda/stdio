import { ProgressBar } from '../src';

const TEST_CASES = [
  {
    size: 100,
    tickSize: 1,
    tick: 10,
    tickDelay: 0,
    expected: '00:00:00 10% [#####·····································] ETA 00:00:00',
    expectedFinish: false,
  },
  {
    size: 60,
    tickSize: 1,
    tick: 1,
    tickDelay: 1000,
    expected: '00:00:01 1% [#··········································] ETA 00:00:59',
    expectedFinish: false,
  },
  {
    size: 60,
    tickSize: 1,
    tick: 1,
    tickDelay: 500,
    expected: '00:00:00 1% [#··········································] ETA 00:00:29',
    expectedFinish: false,
  },
  {
    size: 60,
    tickSize: 1,
    tick: 1,
    tickDelay: 2000,
    expected: '00:00:02 1% [#··········································] ETA 00:01:58',
    expectedFinish: false,
  },
  {
    size: 8,
    tickSize: 2,
    tick: 3,
    tickDelay: 500,
    expected: '00:00:01 75% [################################··········] ETA 00:00:01',
    expectedFinish: false,
  },
  {
    size: 4,
    tickSize: 1,
    tick: 3,
    tickDelay: 1000,
    expected: '00:00:03 75% [################################··········] ETA 00:00:02',
    expectedFinish: false,
  },
  {
    size: 4,
    tickSize: 2,
    tick: 3,
    tickDelay: 500,
    expected: '00:00:01 100% [#########################################] ETA 00:00:00',
    expectedFinish: true,
  },
  {
    size: 4,
    tickSize: 1,
    tick: 4,
    tickDelay: 100,
    expected: '00:00:00 100% [#########################################] ETA 00:00:00',
    expectedFinish: true,
  },
  {
    size: 259200,
    tickSize: 1,
    tick: 2,
    tickDelay: 1000,
    expected: '00:00:02 0% [#············································] ETA 3 días',
    expectedFinish: false,
  },
];

function sleep(delay: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, delay));
}

TEST_CASES.forEach(testCase => {
  test(`${testCase.size}/${testCase.tickSize} > ${testCase.tick}`, async () => {
    const pbar = new ProgressBar(testCase.size, { tickSize: testCase.tickSize, silent: true, terminalWidth: 70 });
    let observed = '';
    let finished = false;
    pbar.onFinish(() => (finished = true));
    while (testCase.tick--) {
      await sleep(testCase.tickDelay);
      observed = pbar.tick();
    }
    expect(observed).toEqual(testCase.expected);
    if (testCase.expectedFinish) {
      await sleep(100);
      expect(finished).toBe(true);
    }
  });
});
