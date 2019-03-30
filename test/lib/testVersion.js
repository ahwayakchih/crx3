const test = require('tape-catch');
const testVersion = require('../../lib/testVersion');

const ACTUAL = 0;
const EXPECTED = 1;
const RESULT = 2;

test('testVersion', t => {
	t.strictEqual(typeof testVersion, 'function', 'Should export a function');

	const CASES = [
		[undefined, undefined, true], // eslint-disable-line no-undefined
		[undefined, '1.0.0', false], // eslint-disable-line no-undefined
		['1.0.0', undefined, true], // eslint-disable-line no-undefined
		['1', '2', false],
		['2', '1', true],
		['1', '1', true],
		['1.0', '1', true],
		['2.0', '1', true],
		['1.0', '1.0', true],
		['2.0', '1.0', true],
		['1', '1.0', true],
		['1', '2.0', false],
		['1.0', '2.0', false],
		['1.0-1', '1', true],
		['1.0-1', '1.1', false],
		['1.0-1', '1.0-1', true],
		['1.0-1', '1.0-2', false],
		['1.0-2', '1.0-1', true],
		['1.0-beta', '1', false],
		['1.0-beta', '1.0', false],
		['1.0-beta', '1.0-beta', true],
		['1.0-beta', '1.0-alpha', true],
		['1.0-alpha', '1.0-beta', false],
		['2.0-alpha', '1.0-beta', true],
		['1.0-alpha', '2.0-beta', false],
		['1.0-beta.1', '1.0-beta.0', true],
		['1.0-beta.1', '1.0-beta.1', true],
		['1.0-beta.1', '1.0-beta.2', false],
		['1.0-beta.1-x', '1.0-beta.1', false],
		['1.0-beta.1-y', '1.0-beta.1-x', true],
		['1.0-beta.1-y', '1.0-beta.1-y', true],
		['1.0-beta.1-y', '1.0-beta.1-z', false],
		['1.2.3-beta', '1.2.3-beta', true],
		['1.2.3-beta', '1.2.3-alpha', true],
		['1.2.3-alpha', '1.2.3-beta', false],
		['1.2.3-alpha', '1.2.3-alpha-1', false],
		['1.2.3-alpha-1', '1.2.3-alpha', true],
		['1.2.3-alpha-1', '1.2.3-alpha-2', false],
		['1.2.3-alpha-beta', '1.2.3-alpha-delta', false],
		['1.2.3-alpha-beta', '1.2.3-alpha-alpha', true],
		['1.2.3-beta', '1', true],
		['1.10.3-65.el6', '1.10.3-42z1.el6_7', true], // From: https://github.com/leohihimax/node-version-compare/issues/2
		['1.10.el6', '1.10.el6_7', false]
	];

	CASES.forEach(c => t.strictEqual(testVersion(c[ACTUAL], c[EXPECTED]), c[RESULT], `"${c[ACTUAL]} >= ${c[EXPECTED]}" should be ${c[RESULT]}`));

	t.end();
});
