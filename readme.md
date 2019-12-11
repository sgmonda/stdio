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

## Installation

To install this module you can use `npm`:

```
npm install stdio
```

Then you can import it from your project, as a whole module or any of its parts independently:

```javascript
import stdio from 'stdio';
```

```javascript
import { getopt, read } from 'stdio';
```

## Usage

This module contains the following features:

### getopt()

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
- `args` (`number|string`): An arguments definition, describing how many ones are required. This can be a number or the special string `"*"` when the amount of arguments for the option is variable.
- `multiple` (`boolean`): If the option should be specified for each value. This makes `stdio` ignore `args` expected count and makes it mandatory to write things like `-m 1 -m 2 -m 3` instead of `-m 1 2 3`.

In case a required option is not defined or any option is not well used at runtime, an automatic help/usage message is printed, aborting the execution:

```
Usage: bla bla bla
```

In case you don't want to abort the execution, then pass a second argument to `getopt()` with this special flag:

```
const options = getopt({...}, { exitOnFailure: false });
```

In this case `options` will have a `null` value but your process will not be finished when your program is not properly used (the terminal command contains errors).

<details>
<summary>Example</summary>
<p>

The following program illustrates all the different types of options and how to use them.

```javascript
hola
```

Here's a valid command for the previous options definition and the result of the `getopt()` response:

```
good command
```
```
options object
```

On the other hand, if any option is not well used, the execution of our program will exit with an error result and the usage message will be shown:

```
wrong usage
```
```
help message
```

</p>
</details>

### read()

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
cat hugefile.txt | node myprogram.js
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

---

To be completed
