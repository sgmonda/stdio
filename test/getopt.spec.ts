import { getopt } from '../index';

const TEST_CASES = [
  {
    command: 'node program.js',
    expected: {},
    options: {},
  },
];

TEST_CASES.forEach(testCase => {
  test(testCase.command, () => {
    const observed = getopt(testCase.options, testCase.command.split(' '));
    const expected = testCase.expected;
    expect(observed).toEqual(expected);
  });
});
