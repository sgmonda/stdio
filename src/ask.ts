const DEFAULT_MAX_RETRIES = 3;

export interface AskConfig {
  options?: string[];
  maxRetries?: number;
  inputStream?: any;
}

function print(text: string, options?: string[]): void {
  if (options) text += ' [' + options.join('/') + ']';
  text += ': ';
  process.stdout.write(text);
}

function ask(question: string, config: AskConfig = {}): Promise<string> {
  const inputStream = config.inputStream || process.stdin;
  return new Promise((resolve, reject) => {
    const callback = (error: string, value?: string): void => (error ? reject(new Error(error)) : resolve(value));

    let tries = config.maxRetries || DEFAULT_MAX_RETRIES;
    inputStream.resume();

    function listener(data: string): void {
      const response = data.toString().trim();

      if (config.options && !config.options.includes(response)) {
        console.log('Unexpected answer. %d retries left.', tries - 1);
        tries--;
        if (tries === 0) {
          inputStream.removeListener('data', listener);
          inputStream.pause();
          callback('Retries spent');
        } else {
          print(question, config.options);
        }
        return;
      }
      inputStream.removeListener('data', listener);
      inputStream.pause();
      callback('', response);
    }
    inputStream.addListener('data', listener);
    print(question, config.options);
  });
}

export default ask;
