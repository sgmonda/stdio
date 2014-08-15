Module for standard input/output management with nodejs.

[![Build Status](https://secure.travis-ci.org/sgmonda/stdio.png)](http://travis-ci.org/sgmonda/stdio)

[![NPM](https://nodei.co/npm/stdio.png)](https://nodei.co/npm/stdio/)

## 1. Installation

To install the most recent release from npm, run:

    npm install stdio

## 2. Usage

You can do many things with this module:
* Parse UNIX-like command line options
* Read standard input, at once or line by line.
* Make command-line questions

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

As you can see, every option in `ops` object can have one of the following 3 types of values:

* The boolean value `true` if it has been specified without an `args` attribute.
* A single `string` if it has been specified with `args: 1`.
* A `string` array, if it has been specified with `args` > 1.

Options can have the `multiple` flag, in which case they can appear multiple times (with one argument each time). The value of that option will be an array with all provided arguments:

```javascript
var ops = stdio.getopt({
    'check': {key: 'c', description: 'What this option means', multiple: true}
});
```
```
node program.js -c 1 -c 2 -c 3
```
```
{ check: ['1', '2', '3'] }

```

Options can have the attribute `multiple`:

```
var ops = stdio.getopt({
    'check': {key: 'c', args: 1, description: 'What this option means', multiple: true}
});
```

in which case they can appear multiple times:

    node test.js -c 1 -c 2 -c 3

So that an array will be returned:

```
{ check: ['1', '2', '3'] }

```

#### Print usage

This module generates a descriptive usage message automatically. You'll see it when your program is called with `--	help` option (or its short version `-h`), which is automatically supported. The following code:

```javascript
var stdio = require('stdio');

var ops = exports.getopt({
	una: {description: 'Sets something to some value', args: 2, mandatory: true},
	otra_muy_larga: {description: 'A boolean flag', key: 'o', mandatory: true},
	una_sin_desc: {description: 'Another boolean flag'},
	ultima: {description: 'A description', key: 'u', args: 1}
});
```

will produce the following output (if it is called with `--help` flag):

```
USAGE: node main.js [OPTION1] [OPTION2]... arg1 arg2...
  --una <ARG1> <ARG2>  	Sets something to some value (mandatory)
  -o, --otra_muy_larga 	A boolean flag (mandatory)
  --una_sin_desc       	Another boolean flag
  -u, --ultima <ARG1>  	A description
```

If a non-expected option is given or a mandatory option isn't, then an error will be shown, suggesting to use `--help` option to know how to use your program and finishing it automatically.

```
Missing "una" argument.
Try "--help" for more information.
```

### 2.2. Read standard input at once

The following code will read the whole standard input at once and put it into `text` variable.

```javascript
var stdio = require('stdio');
stdio.read(function(text){
    console.log(text);
});
```

Obviously it is recommended only for small input streams, for instance a small file:

```
node myprogram.js < input-file.txt
```

### 2.3. Read standard input line by line

The following code will execute dynamically a function over every line, when it is read from the standard input:

```javascript
var stdio = require('stdio');
stdio.readByLines(function lineHandler(line, index) {
    // You can do whatever you want with every line
    console.log('Line %d:', index, line);
}, function (err) {
    console.log('Finished');
});
```

The previous code will apply `lineHandler()` to every line while they are read, without waiting the whole input to end or buffering it, so it is very useful for large text streams. For instance a continuous log:

```
tail -f /var/log/system.log | node myprogram.js
```

### 2.4. Show prompt questions and wait user's answer

The following code will ask the user for some info and then print it.

```javascript
stdio.question('What is your name?', function (err, name) {
    stdio.question('How old are you?', function (err, age) {
        stdio.question('Are you male or female?', ['male', 'female'], function (err, sex) {
            console.log('Your name is "%s". You are a "%s" "%s" years old.', name, sex, age);
        });
    });
});
```

By default `stdio.question()` offers some retries when allowed answers are restricted (see the male/female question above). If no possible answers are specified, then the user can answer whatever he wants to the question.

## 3. Testing

To run tests, use the following command from module's root:

````
npm test
````
