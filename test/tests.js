/*jslint node: true, nomen: true*/
'use strict';

/**
 * Stdio NodeJS module tests
 */

// Dependences =================================================================

var stdio = require('../main.js'),
    exec = require('child_process').exec;

// Tests =======================================================================

/**
 * Input reading tests
 */

(function () {
	var title = 'INPUT read at once\n';
	var i = title.length;

	while ((i = i - 1) > 0) {
		title += '=';
	}

	exec('wc -l test/lipsum.txt', function (err, res) {
		console.assert(err === null, 'An error occurred while reading sample text file');
		var spectedLines = parseInt(res.match(/\d+/)[0], 10);
		stdio.read(function (input) {
			var readedLines = parseInt(input.split('\n').length, 10) - 1;
			console.log('\n' + title);
			console.assert(spectedLines === readedLines, 'Spected and get lines count are different\n'
														 + 'Spec = ' + spectedLines + '\nGet  = ' + readedLines);
			console.log('- Test passed ✓');
		});
	});
}());

/**
 * Getopt tests
 */

var getoptTests = [
	{
		opsSpecification: {},
		argv: ['node', 'program.js'],
		spectedOps: {}
	},
	{
		opsSpecification: {},
		argv: ['node', 'program.js', 'arg1', 'arg2'],
		spectedOps: {
			'args': ['arg1', 'arg2']
		}
	},
	{
		opsSpecification: {
			'test': {}
		},
		argv: ['node', 'program.js', '--test'],
		spectedOps: {'test': true}
	},
	{
		opsSpecification: {
			'test': {key: 't'},
			'other': {key: 'o'}
		},
		argv: ['node', 'program.js', '-o'],
		spectedOps: {'other': true}
	},
	{
		opsSpecification: {
			'test': {key: 't', args: 2},
			'other': {key: 'o'}
		},
		argv: ['node', 'program.js', '-t', 'uno', '237', '--other'],
		spectedOps: {'test': ['uno', '237'], 'other': true}
	},
	{
		opsSpecification: {
			'test': {key: 't', args: 2},
			'other': {key: 'o'}
		},
		argv: ['node', 'program.js', '-t', 'uno', '237', '--other', 'extra1', 'extra2'],
		spectedOps: {'test': ['uno', '237'], 'other': true, 'args': ['extra1', 'extra2']}
	},
	{
		opsSpecification: {
			'test': {key: 't', args: 2},
			'other': {key: 'o'},
			'last': {args: 1}
		},
		argv: ['node', 'program.js', '-t', 'uno', '237', '--other', 'extra1', 'extra2', '--last', '34', 'extra3'],
		spectedOps: {'test': ['uno', '237'], 'other': true, 'args': ['extra1', 'extra2', 'extra3'], 'last': '34'}
	},
	{
		opsSpecification: {
			'joint1': {key: 'a'},
			'joint2': {key: 'b'},
			'joint3': {key: 'c'}
		},
		argv: ['node', 'program.js', '-abc'],
		spectedOps: {joint1: true, joint2: true, joint3: true}
	},
	{
		opsSpecification: {
			'joint1': {key: 'a'},
			'joint2': {key: 'b'},
			'joint3': {key: 'c'}
		},
		argv: ['node', 'program.js', '-ac'],
		spectedOps: {joint1: true, joint3: true}
	},
	{
		opsSpecification: {
			'joint1': {key: 'a'},
			'joint2': {key: 'b'},
			'joint3': {key: 'c'}
		},
		argv: ['node', 'program.js', '-b'],
		spectedOps: {joint2: true}
	},
	{
		opsSpecification: {
			'number': {key: 'n', args: 2},
			'other': {key: 'o'}
		},
		argv: ['node', 'program.js', '-n', '-33', '-237', '--other'],
		spectedOps: {'number': ['-33', '-237'], 'other': true}
	},
	{
		opsSpecification: {
			'number': {key: 'n', args: 2},
			'other': {key: 'o'}
		},
		argv: ['node', 'program.js', '-n', '33', '-237'],
		spectedOps: {'number': ['33', '-237']}
	},
];

(function () {

	var title = 'GETOPT tests\n';
	var i = title.length;

	while ((i = i - 1) > 0) {
		title += '=';
	}
	console.log('\n' + title);

	getoptTests.forEach(function (t, i) {
		var ops = JSON.stringify(stdio.getopt(t.opsSpecification, null, t.argv));
		var spected = JSON.stringify(t.spectedOps);
		console.assert(ops === spected, 'getopt test failed:\n'
					   + 'Spec = ' + spected + '\nGet = ' + ops + '\n');
		console.log('- Test ' + (i + 1) + '/' + getoptTests.length + ' passed ✓');
	});
}());

