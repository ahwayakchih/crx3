const path = require('path');
const test = require('tape-catch');
const getFilePaths = require('../../lib/getFilePaths');

test('getFilePaths', t => {
	t.strictEqual(typeof getFilePaths, 'function', 'Should export function');

	var temp = getFilePaths();
	t.ok(Array.isArray(temp) && temp.length === 0, 'Should return empty array when called without arguments');

	temp = getFilePaths('test');
	t.ok(Array.isArray(temp) && temp.length === 0, 'Should return empty array when called with string instead of array');

	const parentDirname = path.dirname(__dirname);
	temp = getFilePaths([parentDirname]);
	t.ok(Array.isArray(temp) && temp.length > 0, 'Should return non-empty array when called with array');
	t.ok(temp.indexOf(__filename) >= 0, 'Returned array should contain path to this test file');

	var temp2 = getFilePaths([path.join(parentDirname, 'manifest.json')]);
	t.ok(Array.isArray(temp2) && temp2.length > 0, 'Should return non-empty array when called with a single path to "manifest.json"');
	t.ok(temp2.indexOf(__filename) >= 0, 'Returned array should contain path to this test file');
	t.strictEqual(temp.join(','), temp2.join(','), 'Should return the same list');

	t.end();
});
