const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
const test = require('tape-catch');
const crx3stream = require('../../lib/crx3stream');

const CWD = process.cwd();

test('crx3stream', t => {
	t.strictEqual(typeof crx3stream, 'function', 'Should export a function');

	t.test('... without args', testCRXStreamWithoutArgs);
	t.test('... with path only', testCRXStreamWithPathOnly);
	t.test('... with options only', testCRXStreamWithOptionsOnly);
	t.test('... with both path and options', testCRXStreamWithBothPathAndOptions);

	t.end();
});

function testCRXStreamWithoutArgs (t) {
	const stream = crx3stream();

	t.strictEqual(typeof stream, 'object', 'Should return object when called without arguments');
	t.strictEqual(stream.constructor.name, 'CRX3Stream', 'Returned object should be instance of a CRX3Stream class');
	t.strictEqual(stream.crx.cfg.crxPath, path.join(CWD, 'web-extension.crx'), 'Should use default CRX file path');

	compareWithExample(t, stream);
}

function testCRXStreamWithPathOnly (t) {
	const name = `test${process.hrtime.bigint()}.crx`;
	const stream = crx3stream(name);

	t.strictEqual(typeof stream, 'object', 'Should return object when called with path only');
	t.strictEqual(stream.constructor.name, 'CRX3Stream', 'Returned object should be instance of a CRX3Stream class');
	t.strictEqual(stream.crx.cfg.crxPath, path.join(CWD, name), 'Should use specified file path');

	compareWithExample(t, stream);
}

function testCRXStreamWithOptionsOnly (t) {
	const name = `test${process.hrtime.bigint()}.crx`;
	const stream = crx3stream({crxPath: name});

	t.strictEqual(typeof stream, 'object', 'Should return object when called with options only');
	t.strictEqual(stream.constructor.name, 'CRX3Stream', 'Returned object should be instance of a CRX3Stream class');
	t.strictEqual(stream.crx.cfg.crxPath, path.join(CWD, name), 'Should use specified CRX file path');

	compareWithExample(t, stream);
}

function testCRXStreamWithBothPathAndOptions (t) {
	const name = `test${process.hrtime.bigint()}.crx`;
	const stream = crx3stream(name, {crxPath: 'ignored.crx'});

	t.strictEqual(typeof stream, 'object', 'Should return object when called with options only');
	t.strictEqual(stream.constructor.name, 'CRX3Stream', 'Returned object should be instance of a CRX3Stream class');
	t.strictEqual(stream.crx.cfg.crxPath, path.join(CWD, name), 'Should use specified CRX file path');

	compareWithExample(t, stream);
}

function compareWithExample (t, crxStream) {
	const zip = fs.createReadStream(path.join(CWD, 'example', 'example-extension.zip'));

	crxStream.crx.cfg.setFromOptions({keyPath: path.join(CWD, 'example', 'example-extension.pem')});

	// Backup options, because they are cleaned up later by CRX3Stream, before we get to test the files.
	const options = Object.assign({}, crxStream.crx.cfg);

	crxStream.on('close', () => {
		const examplePath = path.join(CWD, 'example', 'example-extension.crx');
		exec(`diff "${options.crxPath}" "${examplePath}"`, err => {
			t.ok(!err, `Created "${options.crxPath}" should not differ from "${examplePath}"`);

			fs.unlink(options.crxPath, err2 => {
				t.end(err || err2 || null);
			});
		});
	});

	zip.pipe(crxStream);
}
