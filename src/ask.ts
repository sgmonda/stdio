const DEFAULT_MAX_RETRIES = 3;

export interface AskConfig {
  options?: string[];
  maxRetries?: number;
  inputStream?: any;
  /** Index of the option to be made the default option */
  defaultIndex?: number;
}

function getInputStream(config: AskConfig): any {
  return config.inputStream || process.stdin;
}

function isInArrBounds(arr: Array<any> | undefined, index: number | undefined): boolean {
  return arr !== undefined && index !== undefined && index >= 0 && index <= arr.length - 1;
}

function print(text: string, config: AskConfig): void {
  const inputStream = getInputStream(config);
  if (inputStream !== process.stdin) return;
  const { options, defaultIndex } = config;
  if (options) {
    if (defaultIndex && isInArrBounds(options, defaultIndex)) text += ' (default ' + options[defaultIndex] + ')';
    text += ' [' + options.join('/') + ']';
  }
  text += ': ';
  process.stdout.write(text);
}

function getOnError(question: string, config: AskConfig, callback: Function): Function {
  const inputStream = getInputStream(config);
  return (listener: any, tries: number): void => {
    if (inputStream === process.stdin) console.log('Unexpected answer. %d retries left.', tries);
    if (!tries) {
      inputStream.removeListener('data', listener);
      inputStream.pause();
      callback('Retries spent');
    } else {
      print(question, config);
    }
  };
}

function getListener(question: string, config: AskConfig, callback: Function): (data: string) => void {
  const inputStream = getInputStream(config);
  let tries = config.maxRetries || DEFAULT_MAX_RETRIES;
  const onError = getOnError(question, config, callback);

  function listener(data: string): void {
    let answer = data.toString().trim();
    if (config.options && !config.options.includes(answer)) {
      if (isInArrBounds(config.options, config.defaultIndex) && answer === '') {
        answer = config.options[config.defaultIndex as number].toString().trim();
      } else return onError(listener, --tries);
    }
    inputStream.removeListener('data', listener);
    inputStream.pause();
    callback('', answer);
  }
  return listener;
}

function ask(question: string, config: AskConfig = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const callback = (error: string, value?: string): void => (error ? reject(new Error(error)) : resolve(value));
    const inputStream = getInputStream(config);
    inputStream.resume();
    const listener = getListener(question, config, callback);
    inputStream.addListener('data', listener);
    print(question, config);
  });
}

export default ask;
