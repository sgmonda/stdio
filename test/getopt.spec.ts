import { getopt } from '../index';

const TEST_CASES = [
  {
    command: 'node program.js',
    expected: {},
    options: {},
  },
];

TEST_CASES.forEach(test => {
  test(command, () => {
    const observed = getopt(test.options, test.command.split(' '));
    const expected = test.expected;
    expect(observed).toEqual(expected);
  });
});
