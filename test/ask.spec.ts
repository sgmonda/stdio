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
