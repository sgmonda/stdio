import { getopt } from '../index';

const TEST_CASES = [
  {
    command: 'node program.js',
    expected: {},
    options: {},
  },
  {
    command: 'node program.js arg1 arg2',
    expected: { args: ['arg1', 'arg2'] },
    options: {},
  },
  {
    command: 'node program.js --test',
    expected: { test: true },
    options: { test: {} },
  },
  {
    command: 'node program.js -o',
    expected: { other: true },
    options: {
      test: { key: 't' },
      other: { key: 'o' },
    },
  },
  {
    command: 'node program.js -t uno 237 --other',
    expected: { test: ['uno', '237'], other: true },
    options: {
      test: { key: 't', args: 2 },
      other: { key: 'o' },
    },
  },
  {
    command: 'node program.js -t uno 237 --other extra1 extra2 --last 34 extra3',
    expected: { test: ['uno', '237'], other: true, args: ['extra1', 'extra2', 'extra3'], last: '34' },
    options: { test: { key: 't', args: 2 }, other: { key: 'o' }, last: { args: 1 } },
  },
  {
    command: 'node program.js -t uno 237 --other extra1 extra2',
    expected: { test: ['uno', '237'], other: true, args: ['extra1', 'extra2'] },
    options: { test: { key: 't', args: 2 }, other: { key: 'o' } },
  },
  {
    command: 'node program.js -abc',
    expected: { joint1: true, joint2: true, joint3: true },
    options: { joint1: { key: 'a' }, joint2: { key: 'b' }, joint3: { key: 'c' } },
  },
  {
    command: 'node program.js -ac',
    expected: { joint1: true, joint3: true },
    options: { joint1: { key: 'a' }, joint2: { key: 'b' }, joint3: { key: 'c' } },
  },
  {
    command: 'node program.js -b',
    expected: { joint2: true },
    options: { joint1: { key: 'a' }, joint2: { key: 'b' }, joint3: { key: 'c' } },
  },
  {
    command: 'node program.js -n -33 -237 --other',
    expected: { number: ['-33', '-237'], other: true },
    options: { number: { key: 'n', args: 2 }, other: { key: 'o' } },
  },
  {
    command: 'node program.js -n 33 -237',
    expected: { number: ['33', '-237'] },
    options: { number: { key: 'n', args: 2 }, other: { key: 'o' } },
  },
  {
    command: 'node program.js --number=88 --pepe 22 33 jose=3',
    expected: { number: '88', pepe: ['22', '33', 'jose=3'] },
    options: { number: { key: 'n', args: 1 }, other: { key: 'o' }, pepe: { args: 3 } },
  },
  {
    command: 'node program.js --url "http://www.example.com/?b=1"',
    expected: { url: '"http://www.example.com/?b=1"' },
    options: { url: { key: 'u', args: 1 } },
  },
  {
    command: 'node program.js -m loc.ark+=13960=t0000693r.meta.json',
    expected: { meta: 'loc.ark+=13960=t0000693r.meta.json' },
    options: { meta: { key: 'm', args: 1 } },
  },
  {
    command: 'node program.js -237',
    expected: null,
    options: { number: { key: 'n', args: 2, mandatory: true }, other: { key: 'o' } },
  },
  {
    command: 'node program.js -m 1 -m 2 -m 3 a b',
    expected: { meta: ['1', '2', '3'], args: ['a', 'b'] },
    options: { meta: { key: 'm', multiple: true } },
  },
  {
    command: 'node program.js --meta 3 4 5 6 -o 3',
    expected: { meta: ['3', '4', '5', '6'], other: true, args: ['3'] },
    options: { meta: { args: '*' }, other: { key: 'o' } },
  },
  {
    command: 'node program.js --other',
    expected: { other: true, meta: 'foo' },
    options: { meta: { key: 'm', default: 'foo' }, other: true },
  },
  {
    command: 'node program.js',
    expected: { meta: ['1', '2'], other: false },
    options: { meta: { key: 'm', args: 2, default: ['1', '2'] }, other: { default: false } },
  },
  {
    command: 'node program.js -m a b',
    expected: { meta: ['a', 'b'], other: false },
    options: { meta: { key: 'm', args: 2, default: ['1', '2'] }, other: { default: false } },
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
    options: { check: { key: 'c', args: 1 }, number: { key: 'n', args: 1 }, header: { key: 'H', args: 1 } },
  },
];

TEST_CASES.slice(0, 4).forEach(testCase => {
  test(testCase.command, () => {
    const observed = getopt(testCase.options, testCase.command.split(' '));
    const expected = testCase.expected;
    expect(observed).toEqual(expected);
  });
});
