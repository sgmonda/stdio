![logo](https://user-images.githubusercontent.com/675812/61961326-88346a80-afc7-11e9-9853-f4ef66ce686c.png)

The *de facto* standard input/output manager for Node.js

[![Build Status](https://secure.travis-ci.org/sgmonda/stdio.png)](http://travis-ci.org/sgmonda/stdio)
[![NPM version](https://img.shields.io/npm/v/stdio.svg)](https://www.npmjs.com/package/stdio)

After a very long time, finally version 2 is here. The cool `stdio` module you cannot live without has been rewritten and improved a lot, with Typescript support, promise-based usage and much more.

**Note**: Version 2 stops supporting non promise-based usage, so it is not compatible with older versions. If you're using an older version of `stdio` please, read this documentation carefully before upgrading.

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

## Features

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

---

To be completed
