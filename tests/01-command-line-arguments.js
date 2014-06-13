/* global describe, it, expect */

'use strict';

var stdio = require('../main.js');

describe('getopt()', function () {

	var testCases = [{
			getoptConfig: {},
			argv: ['node', 'program.js'],
			expected: {}
		}, {
			getoptConfig: {},
			argv: ['node', 'program.js', 'arg1', 'arg2'],
			expected: {
				'args': ['arg1', 'arg2']
			}
		}, {
			getoptConfig: {
				'test': {}
			},
			argv: ['node', 'program.js', '--test'],
			expected: {'test': true}
		}, {
			getoptConfig: {
				'test': {key: 't'},
				'other': {key: 'o'}
			},
			argv: ['node', 'program.js', '-o'],
			expected: {'other': true}
		}, {
			getoptConfig: {
				'test': {key: 't', args: 2},
				'other': {key: 'o'}
			},
			argv: ['node', 'program.js', '-t', 'uno', '237', '--other'],
			expected: {'test': ['uno', '237'], 'other': true}
		}, {
			getoptConfig: {
				'test': {key: 't', args: 2},
				'other': {key: 'o'}
			},
			argv: ['node', 'program.js', '-t', 'uno', '237', '--other', 'extra1', 'extra2'],
			expected: {'test': ['uno', '237'], 'other': true, 'args': ['extra1', 'extra2']}
		}, {
			getoptConfig: {
				'test': {key: 't', args: 2},
				'other': {key: 'o'},
				'last': {args: 1}
			},
			argv: ['node', 'program.js', '-t', 'uno', '237', '--other', 'extra1', 'extra2', '--last', '34', 'extra3'],
			expected: {'test': ['uno', '237'], 'other': true, 'args': ['extra1', 'extra2', 'extra3'], 'last': '34'}
		}, {
			getoptConfig: {
				'joint1': {key: 'a'},
				'joint2': {key: 'b'},
				'joint3': {key: 'c'}
			},
			argv: ['node', 'program.js', '-abc'],
			expected: {joint1: true, joint2: true, joint3: true}
		}, {
			getoptConfig: {
				'joint1': {key: 'a'},
				'joint2': {key: 'b'},
				'joint3': {key: 'c'}
			},
			argv: ['node', 'program.js', '-ac'],
			expected: {joint1: true, joint3: true}
		}, {
			getoptConfig: {
				'joint1': {key: 'a'},
				'joint2': {key: 'b'},
				'joint3': {key: 'c'}
			},
			argv: ['node', 'program.js', '-b'],
			expected: {joint2: true}
		}, {
			getoptConfig: {
				'number': {key: 'n', args: 2},
				'other': {key: 'o'}
			},
			argv: ['node', 'program.js', '-n', '-33', '-237', '--other'],
			expected: {'number': ['-33', '-237'], 'other': true}
		}, {
			getoptConfig: {
				'number': {key: 'n', args: 2},
				'other': {key: 'o'}
			},
			argv: ['node', 'program.js', '-n', '33', '-237'],
			expected: {'number': ['33', '-237']}
		}, {
			getoptConfig: {
				'number': {key: 'n', args: 1},
				'other': {key: 'o'},
				'pepe': {args: 2}
			},
			argv: ['node', 'program.js', '--number=88', '--pepe', '22', '33'],
			expected: {'number': '88', 'pepe': ['22', '33']}
		}, {
			getoptConfig: {
				url: {key: 'u', args: 1}
			},
			argv: ['node', 'program.js', '--url', '"http://www.example.com/?b\\=1"'],
			expected: {url: '"http://www.example.com/?b=1"' }
		}, {
			getoptConfig: {
				meta: {key: 'm', args: 1}
			},
			argv: ['node', 'program.js', '-m', 'loc.ark+\\=13960\\=t0000693r.meta.json'],
			expected: {meta: 'loc.ark+=13960=t0000693r.meta.json' }
		}
	];

	testCases.forEach(function (test, index) {

		it('Test case #' + index, function () {
			var ops = stdio.getopt(test.getoptConfig, null, test.argv);
			var expected = test.expected;
			expect(JSON.stringify(ops)).toBe(JSON.stringify(expected));
		});
	});
});

