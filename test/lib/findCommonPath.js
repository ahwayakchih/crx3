const test = require('tape-catch');
const findCommonPath = require('../../lib/findCommonPath');

test('findCommonPath', t => {
	t.strictEqual(typeof findCommonPath, 'function', 'Should export a function');

	t.strictEqual(findCommonPath(), '', 'Should return empty string when called without arguments');
	t.strictEqual(findCommonPath([]), '', 'Should return empty string when files array is empty');
	t.strictEqual(findCommonPath(['example.txt']), '', 'Should return empty string when no file has separator in path');
	t.strictEqual(findCommonPath(['a/']), 'a/', 'Should return directory when the files contain just a directory');
	t.strictEqual(findCommonPath(['a/example.txt']), 'a/', 'Should return directory when the files contain one path');
	t.strictEqual(findCommonPath(['a/example.txt', 'a/b/example.txt']), 'a/', '[a/f, a/b/f] should return "a/"');
	t.strictEqual(findCommonPath(['a/b/example.txt', 'a/example.txt']), 'a/', '[a/b/f, a/f] should return "a/"');
	t.strictEqual(findCommonPath(['a/b/example.txt', 'a/b/c/example.txt', 'a/example.txt']), 'a/', '[a/b/f, a/b/c/f, a/f] should return "a/"');
	t.strictEqual(findCommonPath(['a/b/example.txt', 'a/b/c/example.txt']), 'a/b/', '[a/b/f, a/b/c/f] should return "a/b/"');

	t.end();
});
