const test = require('tape-catch');
const config = require('../../lib/configuration');

test('configuration', t => {
	t.strictEqual(typeof config, 'function', 'Should export a function');

	const CWD = process.cwd();
	const dirName = 'example-extension';

	const c = config();
	t.strictEqual(typeof c, 'object', 'Should create an object');
	t.strictEqual(typeof c.helpText, 'function', 'Created object should have `helpText` method');
	t.strictEqual(typeof c.setFromOptions, 'function', 'Created object should have `setFromOptions` method');

	t.strictEqual(typeof c.helpText(), 'string', '`helpText()` should return a string');

	t.ok(c.crxPath, 'Should use default CRX file path');
	t.ok(c.crxPath.startsWith(CWD), 'Default CRX file path should be in current work directory');

	t.ok(!c.zipPath, 'Should not set ZIP file path by default');
	t.ok(!c.keyPath, 'Should not set key file path by default');

	c.setFromOptions({
		keyPath: true,
		zipPath: true
	});
	t.ok(c.keyPath, 'Should use default key file path');
	t.ok(c.keyPath.startsWith(CWD), 'Default key file path should be in current work directory');
	t.ok(c.zipPath, 'Should use default ZIP file path');
	t.ok(c.zipPath.startsWith(CWD), 'Default ZIP file path should be in current work directory');

	c.name = '';
	c.crxPath = true;
	c.zipPath = true;
	c.keyPath = true;
	c.setFromOptions({srcPaths: [`${CWD}/${dirName}`]});

	t.strictEqual(c.crxPath, `${CWD}/${dirName}.crx`, 'Should use target directory name as CRX file name');
	t.strictEqual(c.zipPath, `${CWD}/${dirName}.zip`, 'Should use target directory name as ZIP file name');
	t.strictEqual(c.keyPath, `${CWD}/${dirName}.pem`, 'Should use target directory name as key file name');

	c.setFromOptions({srcPaths: [`${CWD}/${dirName}/manifest.json`]});

	t.strictEqual(c.crxPath, `${CWD}/${dirName}.crx`, 'Should use manifest.json directory name as CRX file name');
	t.strictEqual(c.zipPath, `${CWD}/${dirName}.zip`, 'Should use manifest.json directory name as ZIP file name');
	t.strictEqual(c.keyPath, `${CWD}/${dirName}.pem`, 'Should use manifest.json directory name as key file name');

	c.name = '';
	c.crxPath = true;
	c.zipPath = true;
	c.keyPath = true;
	c.setFromOptions({srcPaths: [`${CWD}/${dirName}/some-script.js`, `${CWD}/${dirName}/manifest.json`]});

	t.strictEqual(c.crxPath, `${CWD}/${dirName}.crx`, 'Should find and use manifest.js directory name as CRX file name');
	t.strictEqual(c.zipPath, `${CWD}/${dirName}.zip`, 'Should find and use manifest.js directory name as ZIP file name');
	t.strictEqual(c.keyPath, `${CWD}/${dirName}.pem`, 'Should find and use manifest.js directory name as key file name');

	t.end();
});
