import { ask } from '../src';

const TEST_CASES = [
  {
    question: 'Is this a test?',
    config: {},
    answers: ['I do not know'],
    expected: 'I do not know',
  },
  {
    question: 'Is this another test?',
    config: { options: ['yes', 'no'] },
    answers: ['wrong', 'yes'],
    expected: 'yes',
  },
  {
    question: 'Is this a test, really?',
    config: { options: ['yes', 'no'] },
    answers: ['wrong', 'another wrong', 'third wrong', 'yes'],
    expected: null,
  },
  {
    question: 'Is this a test, really?',
    config: { options: ['yes', 'no'], maxRetries: 7 },
    answers: ['wrong', 'another wrong', 'third wrong', 'wrong', 'also wrong', 'wrong', 'not yet', 'no'],
    expected: null,
  },
  {
    question: 'Is this a test, really?',
    config: { options: ['yes', 'no'], maxRetries: 8 },
    answers: ['wrong', 'another wrong', 'third wrong', 'wrong', 'also wrong', 'wrong', 'not yet', 'no'],
    expected: 'no',
  },
  {
    question: 'Default answer on empty input?',
    config: { options: ['yes', 'no'], defaultIndex: 1 },
    answers: [''],
    expected: 'no',
  },
  {
    question: 'Default answer with index 0?',
    config: { options: ['yes', 'no'], defaultIndex: 0 },
    answers: [''],
    expected: 'yes',
  },
  {
    question: 'Wrong answer is not replaced by default?',
    config: { options: ['yes', 'no'], defaultIndex: 0, maxRetries: 1 },
    answers: ['yws'],
    expected: null,
  },
  {
    question: 'Out of bounds default is ignored?',
    config: { options: ['yes', 'no'], defaultIndex: 5, maxRetries: 1 },
    answers: [''],
    expected: null,
  },
  {
    question: 'Non integer default is ignored?',
    config: { options: ['yes', 'no'], defaultIndex: 0.5, maxRetries: 1 },
    answers: [''],
    expected: null,
  },
];

class StdinMock {
  listener: Function;
  constructor() {
    this.listener = (): void => {};
  }
  resume(): void {}
  pause(): void {}
  addListener(name: string, listener: Function): void {
    this.listener = listener;
  }
  send(data: string): void {
    this.listener(data);
  }
  removeListener(): void {
    this.listener = (): void => {};
  }
}

TEST_CASES.forEach(testCase => {
  test(`${testCase.question} (${JSON.stringify(testCase.config)}]: ${testCase.answers}`, async () => {
    const stdin = new StdinMock();
    setTimeout(() => {
      testCase.answers.forEach(text => stdin.send(text));
    }, 1000);
    try {
      const observed = await ask(testCase.question, { ...testCase.config, inputStream: stdin });
      expect(observed).toBe(testCase.expected);
    } catch (error) {
      expect(testCase.expected).toBe(null);
    }
  });
});

describe('default answer hint', () => {
  const printed = (config: any): string => {
    const write = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const resume = jest.spyOn(process.stdin, 'resume').mockImplementation(() => process.stdin);
    ask('Ice cream?', config);
    const output = String(write.mock.calls[0][0]);
    write.mockRestore();
    resume.mockRestore();
    process.stdin.removeAllListeners('data');
    return output;
  };

  test('is shown for index 0', () => {
    expect(printed({ options: ['yes', 'no'], defaultIndex: 0 })).toBe('Ice cream? (default yes) [yes/no]: ');
  });

  test('is shown for index 1', () => {
    expect(printed({ options: ['yes', 'no'], defaultIndex: 1 })).toBe('Ice cream? (default no) [yes/no]: ');
  });

  test('is not shown without defaultIndex', () => {
    expect(printed({ options: ['yes', 'no'] })).toBe('Ice cream? [yes/no]: ');
  });
});
