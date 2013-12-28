/*jslint node: true, nomen: true*/
'use strict';

/**
 * Stdio NodeJS module tests
 */

// Dependencies =================================================================

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
		var expectedLines = parseInt(res.match(/\d+/)[0], 10);
		stdio.read(function (input) {
			var readedLines = parseInt(input.split('\n').length, 10) - 1;
			console.log('\n' + title);
			console.assert(expectedLines === readedLines, 'expected and get lines count are different\n'
														 + 'Spec = ' + expectedLines + '\nGet  = ' + readedLines);
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
		expectedOps: {}
	},
	{
		opsSpecification: {},
		argv: ['node', 'program.js', 'arg1', 'arg2'],
		expectedOps: {
			'args': ['arg1', 'arg2']
		}
	},
	{
		opsSpecification: {
			'test': {}
		},
		argv: ['node', 'program.js', '--test'],
		expectedOps: {'test': true}
	},
	{
		opsSpecification: {
			'test': {key: 't'},
			'other': {key: 'o'}
		},
		argv: ['node', 'program.js', '-o'],
		expectedOps: {'other': true}
	},
	{
		opsSpecification: {
			'test': {key: 't', args: 2},
			'other': {key: 'o'}
		},
		argv: ['node', 'program.js', '-t', 'uno', '237', '--other'],
		expectedOps: {'test': ['uno', '237'], 'other': true}
	},
	{
		opsSpecification: {
			'test': {key: 't', args: 2},
			'other': {key: 'o'}
		},
		argv: ['node', 'program.js', '-t', 'uno', '237', '--other', 'extra1', 'extra2'],
		expectedOps: {'test': ['uno', '237'], 'other': true, 'args': ['extra1', 'extra2']}
	},
	{
		opsSpecification: {
			'test': {key: 't', args: 2},
			'other': {key: 'o'},
			'last': {args: 1}
		},
		argv: ['node', 'program.js', '-t', 'uno', '237', '--other', 'extra1', 'extra2', '--last', '34', 'extra3'],
		expectedOps: {'test': ['uno', '237'], 'other': true, 'args': ['extra1', 'extra2', 'extra3'], 'last': '34'}
	},
	{
		opsSpecification: {
			'joint1': {key: 'a'},
			'joint2': {key: 'b'},
			'joint3': {key: 'c'}
		},
		argv: ['node', 'program.js', '-abc'],
		expectedOps: {joint1: true, joint2: true, joint3: true}
	},
	{
		opsSpecification: {
			'joint1': {key: 'a'},
			'joint2': {key: 'b'},
			'joint3': {key: 'c'}
		},
		argv: ['node', 'program.js', '-ac'],
		expectedOps: {joint1: true, joint3: true}
	},
	{
		opsSpecification: {
			'joint1': {key: 'a'},
			'joint2': {key: 'b'},
			'joint3': {key: 'c'}
		},
		argv: ['node', 'program.js', '-b'],
		expectedOps: {joint2: true}
	},
	{
		opsSpecification: {
			'number': {key: 'n', args: 2},
			'other': {key: 'o'}
		},
		argv: ['node', 'program.js', '-n', '-33', '-237', '--other'],
		expectedOps: {'number': ['-33', '-237'], 'other': true}
	},
	{
		opsSpecification: {
			'number': {key: 'n', args: 2},
			'other': {key: 'o'}
		},
		argv: ['node', 'program.js', '-n', '33', '-237'],
		expectedOps: {'number': ['33', '-237']}
	},
	{
		opsSpecification: {
			'number': {key: 'n', args: 1},
			'other': {key: 'o'},
			'pepe': {args: 2}
		},
		argv: ['node', 'program.js', '--number=88', '--pepe', '22', '33'],
		expectedOps: {'number': '88', 'pepe': ['22', '33']}
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
		var expected = JSON.stringify(t.expectedOps);
		console.assert(ops === expected, 'getopt test failed:\n'
					   + 'Spec = ' + expected + '\nGet = ' + ops + '\n');
		console.log('- Test ' + (i + 1) + '/' + getoptTests.length + ' passed ✓');
	});
}());
