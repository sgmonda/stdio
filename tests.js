/*jslint node: true, nomen: true*/
'use strict';

/**
 * Stdio NodeJS module tests
 */

// Dependences =================================================================

var stdio = require('./main.js');

// Tests =======================================================================

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
		spectedOps: {'test': {args: ['uno', '237']}, 'other': true}
	},
	{
		opsSpecification: {
			'test': {key: 't', args: 2},
			'other': {key: 'o'}
		},
		argv: ['node', 'program.js', '-t', 'uno', '237', '--other', 'extra1', 'extra2'],
		spectedOps: {'test': {args: ['uno', '237']}, 'other': true, 'args': ['extra1', 'extra2']}
	},
	{
		opsSpecification: {
			'test': {key: 't', args: 2},
			'other': {key: 'o'},
			'last': {args: 1}
		},
		argv: ['node', 'program.js', '-t', 'uno', '237', '--other', 'extra1', 'extra2', '--last', '34', 'extra3'],
		spectedOps: {'test': {args: ['uno', '237']}, 'other': true, 'args': ['extra1', 'extra2', 'extra3'], 'last': {'args': '34'}}
	}
];

(function () {

	var title = 'GETOPT tests\n',
	    i = title.length;

	while ((i = i - 1) > 0) {
		title += '=';
	}
	console.log(title);

	getoptTests.forEach(function (t, i) {
		var ops = JSON.stringify(stdio.getopt(t.opsSpecification, t.argv)),
		    spected = JSON.stringify(t.spectedOps);
		console.assert(ops === spected, 'getopt test failed:\n'
					   + 'Spec = ' + spected + '\nGet = ' + ops + '\n');
		console.log('- Test ' + (i + 1) + '/' + getoptTests.length + ' passed ✓');
	});
}());