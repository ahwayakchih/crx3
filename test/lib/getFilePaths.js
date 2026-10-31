const fs = require('fs');
const path = require('path');
const test = require('tape-catch');
const getFilePaths = require('../../lib/getFilePaths');

test('getFilePaths', t => {
	t.strictEqual(typeof getFilePaths, 'function', 'Should export a function');

	var temp = getFilePaths();
	t.ok(Array.isArray(temp) && temp.length === 0, 'Should return empty array when called without arguments');

	temp = getFilePaths('test');
	t.ok(Array.isArray(temp) && temp.length === 0, 'Should return empty array when called with a string instead of array');

	temp = getFilePaths(['non-existent-file-path']);
	t.ok(Array.isArray(temp) && temp.length === 0, 'Should return empty array when files in list do not exist');

	const parentDirname = path.dirname(__dirname);
	temp = getFilePaths([parentDirname]);
	t.ok(Array.isArray(temp) && temp.length > 0, 'Should return non-empty array when called with array');
	t.ok(temp.indexOf(__filename) >= 0, 'Returned array should contain path to this test file');

	var temp2 = getFilePaths([path.join(parentDirname, 'manifest.json')]);
	t.ok(Array.isArray(temp2) && temp2.length > 0, 'Should return non-empty array when called with a single path to "manifest.json"');
	t.ok(temp2.indexOf(__filename) >= 0, 'Returned array should contain path to this test file');
	t.strictEqual(temp.join(','), temp2.join(','), 'Should return the same list');

	// Issue #22: better handling of symlinks for cases like files/dirs sitting on OneDrive
	const testLinkName = path.join(__dirname, '/test-link.js');
	fs.symlinkSync(__filename, testLinkName, null);
	var temp3 = getFilePaths([path.join(parentDirname, 'manifest.json')]);
	t.ok(temp3.indexOf(testLinkName) < 0, 'Returned array should not contain symlinked path');
	var temp4 = getFilePaths([path.join(parentDirname, 'manifest.json')], true);
	t.ok(temp4.indexOf(testLinkName) >= 0, 'Returned array should contain symlinked path when followSymbolicLinks is true');
	fs.unlinkSync(testLinkName);

	t.end();
});
