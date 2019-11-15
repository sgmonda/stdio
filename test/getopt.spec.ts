import { getopt } from '../index';

interface ITestCase {
  argv: string[];
  expected: { [key: string]: string | string[] | number };
  options: any;
}

const TEST_CASES = [{
  argv: ['node', 'program.js'],
  expected: {},
  options: {},
}];

TEST_CASES.forEach((case) => {
  test(`${case.argv.join(' ')}`, () => {
    const observed = getopt(case.options, case.argv);
    const expected = case.expected;
    expect(observed).toEqual(expected);
  });
});
