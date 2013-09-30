/*jslint node: true, nomen: true, vars: true, plusplus: true*/
'use strict';

var util = require('util');

/**
 * Parses command line options
 * @param {function} options options specification
 */
module.exports.getopt = function (options, argv) {

	var opts = {};           // Options map
	var arg;                 // Every argument
	var spected;
	var i;
	var len;
	var opt;
	var optname;
	var name;
	var j;
	var o;
	var argvBackup;

	argv = argv || process.argv;
	argvBackup = argv.join('&%$·').split('&%$·');

	// Arguments parsing
	argv = argv.slice(2);

	/**
	 * Creates the help description (to be used by printHelp(), for instance)
	 */
	opts.createHelp = function () {

		var o = null, lines = [], maxLength, help = '';

		for (o in options) {
			if (options.hasOwnProperty(o)) {
				var ops = ' ', i;
				for (i = 0; i < options[o].args; i++) {
					ops += '<ARG' + (i + 1) + '> ';
				}
				lines.push(['  ' + (options[o].key ? '-' + options[o].key + ', --' : '--') + o + ops, (options[o].description || '') + (options[o].mandatory ? ' (mandatory)' : '')]);
			}
		}

		maxLength = lines.reduce(function (prev, curr, indx) {
			var aux = curr[0].length;
			if (aux > prev) {
				return aux;
			}
			return prev;
		}, 0);

		lines.forEach(function (l) {
			help += l[0] + (new Array(maxLength - l[0].length + 1)).join(' ') + '\t' + l[1] + '\n';
		});

		return help;
	};

	/**
	 * Prints the standard help message
	 */
	opts.printHelp = function () {
		var usage = 'USAGE: ';
		usage += 'node ' + argvBackup[1].split('/').pop() + ' ';
		var o, i;
		for (o in options) {
			if (options.hasOwnProperty(o)) {
				usage += '[--' + o;
				for (i = 0, len = options[o].args; i < len; i++) {
					usage += ' <ARG' + (i + 1) + '>';
				}
				usage += '] ';
			}
		}
		console.log(usage);
		process.stdout.write(opts.createHelp());
	};

	for (i = 0, len = argv.length; i < len; i = i + 1) {

		opt = null;
		optname = null;

		arg = argv[i];

		if (arg.charAt(0) === '-') {
			opt = {};
			spected = null;
			if (arg.charAt(1) === '-') {

				// It's a long option

				optname = arg.substring(2);
				spected = options[optname];
				if (!spected) {
					console.log('Unknown option: --' + optname);
					opts.printHelp();
					process.exit(-1);
				}

			} else {

				// It's a short option

				for (name in options) {
					if (options.hasOwnProperty(name)) {
						if (options[name].key === arg.substring(1)) {
							optname = name;
							break;
						}
					}
				}

				spected = options[optname];
				if (!spected) {
					console.log('Unknown option: -' + arg.substring(1));
					opts.printHelp();
					process.exit(-1);
				}
			}

			if (argv[i + 1] && argv[i + 1][0] !== '-') {

				// Arguments asociated with this option
				if (spected.args === 1) {

					i = i + 1;
					opt = argv[i];
				} else if (spected.args) {

					opt = [];
					for (j = i + 1; j < i + 1 + (spected.args || 0); j = j + 1) {
						opt.push(argv[j]);
					}
					i += spected.args;

				} else {

					opt = true;
				}

			} else {

				opt = true;
			}

			if (opt) {
				opts[optname] = opt;
			}

		} else {

			if (!opts.args) {
				opts.args = [];
			}

			opts.args.push(argv[i]);
		}
	}

	// Check if two options has the same short key

	var key = null;
	var shorts = {};
	for (key in options) {
		if (options.hasOwnProperty(key) && options[key].key) {
			if (shorts[options[key].key]) {
				console.log('Wrong options specification: There are two or more options with the key "-%s"', options[key].key);
				process.exit(-1);
			}
			shorts[options[key].key] = true;
		}
	}

	// Check if there is any mandatory and not specified option, or any wrong specified one

	var mandatoryNotSpecified = [];
	var wrongSpecified = [];

	for (o in options) {

		if (options.hasOwnProperty(o)) {

			var argsCount = parseInt(options[o].args, 10);

			if (opts[o] === true && argsCount === 1) {

				// Wrong specified
				wrongSpecified.push(o);

			} else if (opts[o] && argsCount >= 2) {

				for (i = 0; i < argsCount; i++) {
					if (!opts[o][i]) {
						// Wrong specified
						wrongSpecified.push(o);
						break;
					}
				}

			} else if (!opts[o] && options[o].mandatory) {

				// Not specified being mandatory
				mandatoryNotSpecified.push(o);
			}
		}
	}

	if (wrongSpecified.length > 0) {
		var error2 = 'Incomplete specification of option' + (mandatoryNotSpecified.length > 1 ? 's' : '') + ': ';
		error2 += wrongSpecified.map(function (o) {
			return '--' + o;
		}).join(', ');
		console.log(error2);
	}
	if (mandatoryNotSpecified.length > 0) {
		var error = 'Mandatory option' + (mandatoryNotSpecified.length > 1 ? 's' : '') + ' not specified: ';
		error += mandatoryNotSpecified.map(function (o) {
			return '--' + o;
		}).join(', ');
		console.log(error);
	}

	if (mandatoryNotSpecified.length > 0 || wrongSpecified.length > 0) {
		opts.printHelp();
		process.exit(-1);
	}

	return opts;
};


/**
 * Reads the complete standard input
 * @param {function} callback
 */
module.exports.read = function (callback) {

	if (!callback) {
		throw new Error('no callback provided to readInput() call');
	}

	var inputdata = '';

	process.stdin.resume();
	process.stdin.on('data', function (text) {
		inputdata += String(text);
	});
	process.stdin.on('end', function () {
		callback(inputdata);
	});
};

/**
 * Printf-like output
 * @param {String} format (use %s, %d or %j)
 * @param {*} arguments
 */
module.exports.printf = function () {
	process.stdout.write(util.format.apply(this, arguments));
};
