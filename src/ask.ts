const DEFAULT_MAX_RETRIES = 3;

export interface AskConfig {
  options?: string[];
  maxRetries?: number;
}

function print(text: string, options?: string[]): void {
  if (options) text += ' [' + options.join('/') + ']';
  text += ': ';
  process.stdout.write(text);
}

function ask(question: string, config: AskConfig = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const callback = (error: string, value?: string): void => (error ? reject(new Error(error)) : resolve(value));

    let tries = config.maxRetries || DEFAULT_MAX_RETRIES;
    process.stdin.resume();

    function listener(data: string): void {
      const response = data
        .toString()
        .toLowerCase()
        .trim();

      if (config.options && !config.options.includes(response)) {
        console.log('Unexpected answer. %d retries left.', tries - 1);
        tries--;
        if (tries === 0) {
          process.stdin.removeListener('data', listener);
          process.stdin.pause();
          callback('Retries spent');
        } else {
          print(question, config.options);
        }
        return;
      }
      process.stdin.removeListener('data', listener);
      process.stdin.pause();
      callback('', response);
    }

    process.stdin.addListener('data', listener);
    print(question, config.options);
  });
}

export default ask;
