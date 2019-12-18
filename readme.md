![logo](https://user-images.githubusercontent.com/675812/61961326-88346a80-afc7-11e9-9853-f4ef66ce686c.png)

The *de facto* standard input/output manager for Node.js

[![Build Status](https://secure.travis-ci.org/sgmonda/stdio.png)](http://travis-ci.org/sgmonda/stdio)
[![NPM version](https://img.shields.io/npm/v/stdio.svg)](https://www.npmjs.com/package/stdio)

After a very long time, finally version 2 is here. The cool `stdio` module you cannot live without has been rewritten and improved a lot, with Typescript support, promise-based usage and much more.

**Note**: Version 2 stops supporting non promise-based usage, so it is not compatible with older versions. If you're using an older version of `stdio` please, read this documentation carefully before upgrading.

Table of contents:

- [Installation](#installation)
- [Usage](#usage)
  - [getopt()](#getopt)
  - [read()](#read)
  - [ProgressBar](#progressbar)

# Installation

To install this module you can use `npm`:

```
$ npm install stdio
```

Then you can import it from your project, as a whole module or any of its parts independently:

```javascript
import stdio from 'stdio';
```

```javascript
import { getopt, read } from 'stdio';
```

# Usage

This module contains the following static functions:

- `getopt()`: a function to parse command-line arguments.
- `read()`: an async function to read the standard input (or huge files) by lines, without having to worry about system resources.
- `ask()`: an async function to ask questions in a terminal and wait for a user's response.

And the following classes:

- `ProgressBar`: a class to create command-line progress bars.

Next sections will show how to use all of them.

## getopt()

This function gives parsed UNIX-like command-line and options, preprocessed and ready to be used in an easy way. It is inspired by C standard library under UNIX.

```javascript
import { getopt } from 'stdio';
const options = getopt({
  <option_name_1>: {<definition>},
  <option_name_2>: {<definition>},
  <option_name_3>: {<definition>},
  ...
});
```

Where `<definition>` is an object describing each option. These are the supported fields to define an option:

- `key` (`string`): The short name for the option. It is a single-letter string.
- `description` (`string`): The option description. A text for humans to understand what the option means.
- `required` (`boolean`): If the option is mandatory or not.
- `args` (`number|string`): The expected arguments count for the option (if the option expects arguments). This can be a number or the special string `"*"` when it is variable.
- `multiple` (`boolean`): If the option should be specified for each value. This makes it mandatory to write things like `-m 1 -m 2 -m 3` instead of `-m 1 2 3`.
- `default`: (`string[]` or `string`): The default value for an option, in case it is not provided in the command.

Positional arguments (those not precedeed by an option) can be customized, too, using the special option `_meta_`, which supports some limits in the amount of required args:

```javascript
import { getopt } from 'stdio';
const options = getopt({
  <option_name_1>: {<definition>},
  <option_name_2>: {<definition>},
  <option_name_3>: {<definition>},
  ...
  _meta_: { minArgs: <number>, maxArgs: <number>, args: <number> },
});
```

In case a required option is not defined or any option is not well used at runtime, an automatic help/usage message is printed, aborting the execution. This message is also shown automatically in case one of the special options `-h, --help` is provided.

```
USAGE: node example.js [OPTION1] [OPTION2]... arg1 arg2...
The following options are supported:
  -<key_1>, --<option_name_1>
  -<key_2>, --<option_name_2>
  ...
```

<details>
<summary>Behavior customization</summary>
<p>

In case you want to customize the automatic behavior when a command is wrong using your program, a second argument is supported by the `getopt()` call:

```
const options = getopt({...}, {<behavior_customizations>});
```

Here are the supported customizations:

- `printOnFailure` (`boolean`): Print the usage/help message when your user writes a wrong command. This is `true` by default.
- `exitOnFailure` (`boolean`): Kill the process with an exit code of failure. This is `true` by default.
- `throwOnFailure` (`boolean`): Throw an exception in the `getopt()` call you can catch. This is `false` by default.

Please, note that `exitOnFailure` and `throwOnFailure` behavior customizations are not compatible. Only one of them is allowed at the same time.

</p>
</details>

The response of a `getopt()` call is a simple plain object with a value per option specified in the command. Each value can be one of the following:

- `boolean`, for options not needing arguments.
- `string`, for options expecting a single argument.
- `string[]`, for options expecting more than one argument.

See the following example for a better understanding of how to use `getopt()` and the expected resoponse:

<details>
<summary>Example</summary>
<p>

Here is a basic example of how to use `getopt()`. Please, note you'll find many more examples in the tests folder.

```javascript
import { getopt } from 'stdio';

const options = getopt({
  name: { key: 'n', description: 'A name for the project', args: 1, required: true },
  keywords: { key: 'k', description: 'Some keywords to describe something', args: '*', multiple: true },
  languages: { args: '*' },
  finished: { description: 'If the project is finished' },
});

console.log('Stdio rocks!\n', options);
```

Here's a valid command for the previous options definition and the result of the `getopt()` response:

```
$ node example.js -n 'hello world' -k leisure -k health -k sport --languages javascript typescript c++ --finished
```
```
Stdio rocks!
 {
  name: 'hello world',
  keywords: [ 'leisure', 'health', 'sport' ],
  languages: [ 'javascript', 'typescript', 'c++' ],
  finished: true
}
```

On the other hand, if any option is not well used, the execution of our program will exit with an error result and the usage message will be shown. In this case, we omit the mandatory option `--name, -n`:

```
$ node example.js -k leisure -k health -k sport --languages javascript typescript c++ --finished
```
```
Missing option: "--name"
USAGE: node example.js [OPTION1] [OPTION2]... arg1 arg2...
The following options are supported:
  -n, --name <ARG1>          	A name for the project (required)
  -k, --keywords <ARG1>      	Some keywords to describe something (multiple)
  --languages <ARG1>...<ARGN>
  --finished                 	If the project is finished
```

Remember the same happens when `--help` or `-h` options are passed. They are reserved to be used to request help.

</p>
</details>

## read()

This function reads standard input by lines, waiting for a line to be processed successfully before reading the next one. This is perfect for huge files as lines are read only as you process them, so you don't have to worry about system resources:

```javascript
import { read } from 'stdio';

async function onLine (line, index) {
  console.log('Processing line %d: %s', index, line);
  // Do your async stuff
}

read(onLine)
  .then(stats => console.log('Finished', stats))
  .catch(error => console.warn('Error', error));
```

Note that `onLine` is an `async` function, what means it returns a promise. `read()` call itself also returns a promise. In case one line fails being processed (its promise is rejected) the full `read()` promise will be rejected, too.

Once a `read()` successful call finishes (when all lines have been processed successfully), a small object with some stats is returned:

```typescript
{
  length: number; // Number of lines
  times: Array<number>; // Duration of each line processor
  timesAverage: number; // Average duration of line processing
}
```

<details>
<summary>Example</summary>
<p>

The following command reads a huge file and pipes it to a simple program:

```
$ cat hugefile.txt | node myprogram.js
```

Where `myprogram.js` prints one line per second, including the line number at the begining:

```javascript
import { read } from 'stdio';

function sleep (delay) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

async function onLine (line, index) {
  console.log(`#${index}: ${line}`);
  await sleep(1000);
}

read(onLine)
  .then((stats) => console.log('Finished', stats))
  .catch((error) => console.warn('Error', error));
```

The output is something like this:

```
#1: This is the first line of hugefile.txt
#2: Here the second one
#3: A third line...
```

</p>

## ProgressBar 

This utility let you create progress bar instances that are printed automatically in the terminal, using a beautiful format and estimating the remaining time of a task. Using it is as simple as follows:

```javascript
import { ProgressBar } from 'stdio';

const bar = new ProgressBar(100, 1); // size of 100, tick of 1
...
bar.tick(); // This increments the bar value by 1
bar.onFinish(() => console.log('FINISHED'));
```
Note that progress bars take the 100% of the terminal width where your code runs. No matter if you use a size of 10 or 10000 ticks. `stdio` takes care about the formatting so you don't have to worry about it.

<details>
<summary>Example</summary>
<p>

The following code will create a progress bar of 345 pieces and increments of 1. It means the progress bar will be at 100% when we've called `.tick()` 345 times.

```javascript
// import { getopt } from './dist';
const ProgressBar = require('./dist/ProgressBar').default;

var pbar = new ProgressBar(345, 1);
var i = setInterval(function () {
	pbar.tick();
}, 1000);
pbar.onFinish(function () {
	console.log('finish');
	clearInterval(i);
});
```

If you run the previous code, the following will be shown:

```
00:00:12 3% [###··········································································] ETA 00:05:35
```

</p>
