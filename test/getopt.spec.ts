import { getopt } from '../index';
import { Options } from '../src/getopt';

const TEST_CASES = [
  {
    command: 'node program.js',
    expected: {},
    config: {},
  },
  {
    command: 'node program.js arg1 arg2',
    expected: { args: ['arg1', 'arg2'] },
    config: {},
  },
  {
    command: 'node program.js --test',
    expected: { test: true },
    config: { test: {} },
  },
  {
    command: 'node program.js -o',
    expected: { other: true },
    config: {
      test: { key: 't' },
      other: { key: 'o' },
    },
  },
  {
    command: 'node program.js -t uno 237 --other',
    expected: { test: ['uno', '237'], other: true },
    config: {
      test: { key: 't', args: 2 },
      other: { key: 'o' },
    },
  },
  {
    command: 'node program.js -t uno 237 --other extra1 extra2 --last 34 extra3',
    expected: { test: ['uno', '237'], other: true, args: ['extra1', 'extra2', 'extra3'], last: '34' },
    config: { test: { key: 't', args: 2 }, other: { key: 'o' }, last: { args: 1 } },
  },
  {
    command: 'node program.js -t uno 237 --other extra1 extra2',
    expected: { test: ['uno', '237'], other: true, args: ['extra1', 'extra2'] },
    config: { test: { key: 't', args: 2 }, other: { key: 'o' } },
  },
  {
    command: 'node program.js -abc',
    expected: { joint1: true, joint2: true, joint3: true },
    config: { joint1: { key: 'a' }, joint2: { key: 'b' }, joint3: { key: 'c' } },
  },
  {
    command: 'node program.js -ac',
    expected: { joint1: true, joint3: true },
    config: { joint1: { key: 'a' }, joint2: { key: 'b' }, joint3: { key: 'c' } },
  },
  {
    command: 'node program.js -b',
    expected: { joint2: true },
    config: { joint1: { key: 'a' }, joint2: { key: 'b' }, joint3: { key: 'c' } },
  },
  {
    command: 'node program.js -n -33 -237 --other',
    expected: { number: ['-33', '-237'], other: true },
    config: { number: { key: 'n', args: 2 }, other: { key: 'o' } },
  },
  {
    command: 'node program.js -n 33 -237',
    expected: { number: ['33', '-237'] },
    config: { number: { key: 'n', args: 2 }, other: { key: 'o' } },
  },
  {
    command: 'node program.js --number=88 --pepe 22 33 jose=3',
    expected: { number: '88', pepe: ['22', '33', 'jose=3'] },
    config: { number: { key: 'n', args: 1 }, other: { key: 'o' }, pepe: { args: 3 } },
  },
  {
    command: 'node program.js --number=a=b --pepe 22 33 jose=3',
    expected: { number: 'a=b', pepe: ['22', '33', 'jose=3'] },
    config: { number: { key: 'n', args: 1 }, other: { key: 'o' }, pepe: { args: 3 } },
  },
  {
    command: 'node program.js --url "http://www.example.com/?b=1"',
    expected: { url: '"http://www.example.com/?b=1"' },
    config: { url: { key: 'u', args: 1 } },
  },
  {
    command: 'node program.js -m loc.ark+=13960=t0000693r.meta.json',
    expected: { meta: 'loc.ark+=13960=t0000693r.meta.json' },
    config: { meta: { key: 'm', args: 1 } },
  },
  {
    command: 'node program.js -237',
    expected: null,
    config: { number: { key: 'n', args: 2, mandatory: true }, other: { key: 'o' } },
  },
  {
    command: 'node program.js -m 1 -m 2 -m 3 a b',
    expected: { meta: ['1', '2', '3'], args: ['a', 'b'] },
    config: { meta: { key: 'm', multiple: true } },
  },
  {
    command: 'node program.js --meta 3 4 5 6 -o 3',
    expected: { meta: ['3', '4', '5', '6'], other: true, args: ['3'] },
    config: { meta: { args: '*' }, other: { key: 'o' } },
  },
  {
    command: 'node program.js --other',
    expected: { other: true, meta: 'foo' },
    config: { meta: { key: 'm', default: 'foo' }, other: true },
  },
  {
    command: 'node program.js',
    expected: { meta: ['1', '2'], other: false },
    config: { meta: { key: 'm', args: 2, default: ['1', '2'] }, other: { default: false } },
  },
  {
    command: 'node program.js -m a b',
    expected: { meta: ['a', 'b'], other: false },
    config: { meta: { key: 'm', args: 2, default: ['1', '2'] }, other: { default: false } },
  },
  {
    command:
      'node program.js http://localhost:80/ -c 2 -n 1 -H Cookie:SPRING_SECURITY_CONTEXT=ZmYzYjZmYjItZThjOS00ZmZhLTkyOWQtZDRjYzE3NmRmZWIy',
    expected: {
      args: ['http://localhost:80/'],
      check: '2',
      number: '1',
      header: 'Cookie:SPRING_SECURITY_CONTEXT=ZmYzYjZmYjItZThjOS00ZmZhLTkyOWQtZDRjYzE3NmRmZWIy',
    },
    config: { check: { key: 'c', args: 1 }, number: { key: 'n', args: 1 }, header: { key: 'H', args: 1 } },
  },
  {
    command: 'node program.js -m',
    expected: null,
    config: { meta: { key: 'm', args: 2 }, other: { default: false } },
    options: { throwOnFailure: true },
    error: `Option "--meta" requires 2 arguments, but 1 were provided
USAGE: node program.js [OPTION1] [OPTION2]... arg1 arg2...
The following options are supported:
  -m, --meta <ARG1> <ARG2>
  --other`,
  },
  {
    command: 'node program.js -237',
    expected: null,
    config: { number: { key: 'n', args: 4, mandatory: true }, other: { key: 'o' } },
    options: { throwOnFailure: true },
    error: `Missing option: "--number"
USAGE: node program.js [OPTION1] [OPTION2]... arg1 arg2...
The following options are supported:
  -n, --number <ARG1> <ARG2> <ARG3> <ARG4> 	 (mandatory)
  -o, --other`,
  },
  {
    command: 'node program.js -237 -k',
    expected: null,
    config: { number: { key: 'n' }, other: { key: 'o' } },
    options: { throwOnFailure: true },
    error: `Unknown option: "-k"
USAGE: node program.js [OPTION1] [OPTION2]... arg1 arg2...
The following options are supported:
  -n, --number
  -o, --other`,
  },
  {
    command: 'node program.js -237 --help',
    expected: null,
    config: { number: { key: 'n' }, other: { key: 'o' } },
    options: { throwOnFailure: true },
    error: `USAGE: node program.js [OPTION1] [OPTION2]... arg1 arg2...
The following options are supported:
  -n, --number
  -o, --other`,
  },
  {
    command: 'node program.js -n -234 34 -n=23',
    expected: null,
    config: { number: { key: 'n', args: 2 }, other: { key: 'o' } },
    options: { throwOnFailure: true },
    error: `Option "--number" provided many times
USAGE: node program.js [OPTION1] [OPTION2]... arg1 arg2...
The following options are supported:
  -n, --number <ARG1> <ARG2>
  -o, --other`,
  },
  {
    command: 'node program.js -h',
    expected: null,
    config: { meta: { key: 'm', args: 1, default: 'foo' }, other: true },
    options: { throwOnFailure: true },
    error: `USAGE: node program.js [OPTION1] [OPTION2]... arg1 arg2...
The following options are supported:
  -m, --meta <ARG1> 	 ("foo" by default)
  --other`,
  },
];

//@TODO _meta_ and help

TEST_CASES.forEach(testCase => {
  test(testCase.command, () => {
    const options: Options = {
      exitOnFailure: false,
      printOnFailure: false,
      ...testCase.options,
    };
    try {
      const observed = getopt(testCase.config, testCase.command.split(' '), options);
      const expected = testCase.expected;
      expect(observed).toEqual(expected);
    } catch (error) {
      expect(options.throwOnFailure).toBe(true);
      expect(error.message).toEqual(testCase.error);
    }
  });
});
