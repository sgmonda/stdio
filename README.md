Module for input/output management with nodejs.

[![Build Status](https://secure.travis-ci.org/sgmonda/stdio.png)](http://travis-ci.org/sgmonda/stdio)

Website: http://sgmonda.github.io/stdio/

## 1. Installation

To install the most recent release from npm, run:

    npm install stdio

## 2. Usage

You can do many things with this module:
* Parse UNIX-like command line options
* Read standard input at once
* Make prompt questions

### 2.1. Parse Unix-like command line options

```javascript
var stdio = require('stdio');
var ops = stdio.getopt({
    'check': {key: 'c', args: 2, description: 'What this option means'},
    'map': {key: 'm', description: 'Another description', mandatory: true},
    'kaka': {key: 'k', args: 2, mandatory: true},
    'ooo': {key: 'o'}
});
console.log(ops);
```

If you run the previous example with the command

    node pruebas.js -c 23 45 88 --map -k 23 44 cosa

Program output will be:

    { check: [ '23', '45' ],
      args: [ '88', 'cosa' ],
      map: true,
      kaka: [ '23', '44' ] }

So you can check options:

```javascript
if(ops.map){
    // Your action
}
if(ops.kaka){
    // Your action, using ops.kaka[0] or ops.kaka[1] or...
}
```

As you can see, every option in `ops` object can has 3 different type of values:
* The boolean value `true` if it has been specified without an `args` attribute.
* A single `string` if it has been specified with `args: 1`.
* A `string` array, if it has been specified with `args` >= 2.

#### Print usage

This module can generate an usage message automatically. You can use it when user specifies `--help` option, which is automatically supported. This code:

```javascript
var stdio = require('stdio');

var ops = stdio.getopt({
	una: {description: 'Sets something to some value', key: 'u', args: 2, mandatory: true},
	otra_muy_larga: {description: 'A boolean flag', key: 'o', mandatory: true},
	una_sin_desc: {description: 'Another boolean flag'},
	ultima: {description: 'A description', key: 'u', args: 1}
}, '[FILE1] [FILE2] ...'); // Optional extra arguments description
```

will produce the following output (if it is called with `--help` flag):

```
USAGE: node something.js [OPTIONS] [FILE1] [FILE2] ...
  -u, --una <ARG1> <ARG2> 	Sets something to some value (mandatory)
  -o, --otra_muy_larga    	A boolean flag (mandatory)
  --una_sin_desc          	Another boolean flag
  -u, --ultima <ARG1>     	A description
```

If a non-spected option is given or a mandatory option is not, an error (followed by the usage message) will be shown, finishing your program automatically. It's cool, isn`t it?

### 2.2. Read standard input at once

This simple following code will read the whole standard input.

```javascript
var stdio = require('stdio');
stdio.read(function(data){
    console.log(data);
});
```

Obviously it is not recommended for huge input files.

### 2.3. Show prompt questions and wait user's answer

```javascript
var stdio = require('stdio');
stdio.question('This is a question?', ['y', 'n'], function (err, answer) {
    // Use answer here
});
```

The previous code will show something like the following:

````
This is a question? [y/n]:
````

and waits until user enters an answer. There will be 3 retries before reporting an error by mean of the callback.

## 3. Testing

To run tests, use the following command from module's root:

````
npm test
````

## Changelog

### 0.1.5

* Added support for prompt questions without options

### 0.1.4

* New fancy feature! Now you can show simple prompts to interact with users by mean of a question.
* Old printf-like feature has been removed.

### 0.1.3

* Support for extended large options added. Now it is possible to write `--anoption=44` instead of `--anoption 44`. This works only for options with a single parameter.

### 0.1.2

* Bug fix: Negative numbers as parameters caused wrong errors.

### 0.1.1

* Grouped short options support added (for boolean flags). Now you can write `-abc` instead of `-a -b -c`.
* Usage message has been simplified. Extra arguments description is supported now.

### 0.1.0

* If an option is specified with less arguments than the specified, an error (and the help message) is shown and program finishes.
* Captured options now has 3 possible values: `true`, a single `string` or an array of `strings`. Much easier to use than in previous releases (but incompatible with them, so be careful updating).

## Projects using `stdio` module

The following projects are currently using `stdio` module:

* mammock: https://github.com/earmbrust/mammock
* sqsmonitor: https://github.com/hasallen/sqsmonitor
* frejus: https://npmjs.org/package/frejus

If you use this module in your project, please, let us know.
