'use strict';

/**
 * Check if an argument seems to be a number
 **/
function isNumericalArgument(arg) {
	return (/^[\d\-.,]+$/).test(arg);
}

/**
 * Process an arguments list and refactorizes it replacing each -a=b element for two new elements: -a and b
 **/
function preProcessArguments (argv) {

	var processedArgs = [];
	argv.forEach(function (arg) {

		// If the argument is not an option, do not touch it
		if (arg[0] !== '-' || isNumericalArgument(arg)) {
			processedArgs.push(arg);
			return;
		}

		// For collapsed options, like "-abc" instead of "-a -b -c"
		if (arg[0] === '-' && arg[1] !== '-' && arg.length > 2 && arg.indexOf('=') === -1) {
			processedArgs = processedArgs.concat(arg.slice(1).split('').map(function (x) {
				return '-' + x;
			}));
			return;
		}

		// The general case, without collapsed options or assignments
		if (arg[0] !== '-' || arg.indexOf('=') === -1) {
			processedArgs.push(arg);
			return;
		}

		// For assignment options, like "-b=2" instead of "-b 2"
		arg = arg.match(/(.*?)=(.*)/);
		processedArgs.push(arg[1]);
		processedArgs.push(arg[2]);
	});
	return processedArgs;
}

/**
 * Builds an arguments map from a processed arguments list and a getopt() options object
 **/
function extractArgumentsMap (argv, config) {

	/**
	 * Find the option name of an argument key
	 **/
	function getOptionNameFromArgument (key) {

		// If key is a large form, then it is the option name itself
		if (key.indexOf('--') === 0) {
			return key.slice(2);
		}

		// If key is a short form, then we have to find the option name
		key = key.slice(1);
		for (var option in config) {
			if (config[option].key === key) {
				return option;
			}
		}

		// If no name is found, throw an error
		throw new Error('Unknown option: "' + key + '"');
	}

	/**
	 * Check if all arguments have been already specified for an option
	 **/
	function isOptionCompleted (option) {

		// args option is never fully specified, so any free argument is always a part of it
		if (option === 'args') {
			return false;
		}

		// Compute how many arguments have been already specified and how many ones are expected
		var argsCount = 0;
		if (config[option]) {
			if (Array.isArray(options[option])) {
				argsCount = options[option].length;
			} else if (options[option] !== true){
				argsCount = 1;
			} else {
				argsCount = 0;
			}
		}
		var expected = config[option].args;
		return !expected || (argsCount === expected);
	}

	// Remove "node" and "program.js", then preprocess arguments array
	argv = argv.slice(2);
	argv = preProcessArguments(argv);

	var options = {};
	var lastArgument;

	for (var i = 0, len = argv.length; i < len; i++) {

		if (argv[i][0] === '-' && !isNumericalArgument(argv[i])) {

			lastArgument = getOptionNameFromArgument(argv[i]);
			options[lastArgument] = true;

		} else {

			if (!lastArgument || isOptionCompleted(lastArgument)) {
				lastArgument = 'args';
			}
			if (options[lastArgument] === true) {
				options[lastArgument] = argv[i];
			} else if (Array.isArray(options[lastArgument])) {
				options[lastArgument].push(argv[i]);
			} else if (lastArgument === 'args') {
				options[lastArgument] = [argv[i]];
			} else {
				options[lastArgument] = [options[lastArgument]];
				options[lastArgument].push(argv[i]);
			}
		}
	}

	return options;
}

/**
 * Core getopt function
 **/
function getopt (config, helpTail, argv) {

	return extractArgumentsMap(argv || process.argv, config);
}

// Exports
module.exports.getopt = getopt;
module.exports.preProcessArguments = preProcessArguments;
