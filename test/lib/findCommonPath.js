const test = require('tape-catch');
const path = require('path');
const findCommonPath = require('../../lib/findCommonPath');

test('findCommonPath', t => {
	t.strictEqual(typeof findCommonPath, 'function', 'Should export a function');

	const a = `a${path.sep}`;
	const ae = path.join('a', 'example.txt');
	const abe = path.join('a', 'b', 'example.txt');
	const abce = path.join('a', 'b', 'c', 'example.txt');
	t.strictEqual(findCommonPath(), '', 'Should return empty string when called without arguments');
	t.strictEqual(findCommonPath([]), '', 'Should return empty string when files array is empty');
	t.strictEqual(findCommonPath(['example.txt']), '', 'Should return empty string when no file has separator in path');
	t.strictEqual(findCommonPath([a]), a, 'Should return directory when the files contain just a directory');
	t.strictEqual(findCommonPath([ae]), a, 'Should return directory when the files contain one path');
	t.strictEqual(findCommonPath([ae, abe]), a, '[a/f, a/b/f] should return "a/"');
	t.strictEqual(findCommonPath([abe, ae]), a, '[a/b/f, a/f] should return "a/"');
	t.strictEqual(findCommonPath([abe, abce, ae]), a, '[a/b/f, a/b/c/f, a/f] should return "a/"');
	t.strictEqual(findCommonPath([abe, abce]), path.join('a', 'b') + path.sep, '[a/b/f, a/b/c/f] should return "a/b/"');

	t.end();
});
