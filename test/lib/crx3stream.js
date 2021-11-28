const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
const test = require('tape-catch');
const crx3stream = require('../../lib/crx3stream');
const tryExec = require('./support/tryExec');

const CWD = process.cwd();

const DEFAULT_FILE_CHECK_DELAY = 1500;

const FILE_CHECK_DELAY = parseInt(process.env.FILE_CHECK_DELAY || 0, 10) || DEFAULT_FILE_CHECK_DELAY;

test('crx3stream', t => {
	t.strictEqual(typeof crx3stream, 'function', 'Should export a function');

	t.test('... without args', testCRXStreamWithoutArgs);
	t.test('... with path only', testCRXStreamWithPathOnly);
	t.test('... with options only', testCRXStreamWithOptionsOnly);
	t.test('... with both path and options', testCRXStreamWithBothPathAndOptions);

	t.end();
});

/* eslint-disable jsdoc/require-jsdoc */
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

	crxStream.once('finish', () => {
		t.strictEqual(typeof crxStream.crx.appId, 'object', 'Finishing CRX3Stream should have `crx.appId` Buffer set');
		t.strictEqual(crxStream.crx.appId.length, 16, '`crx.appId` should be 16 bytes long'); // eslint-disable-line no-magic-numbers

		t.strictEqual(typeof crxStream.crx.encodedAppId, 'string', 'Finishing CRX3Stream should have `crx.encodedAppId` string set');
		t.strictEqual(crxStream.crx.encodedAppId.length, 32, '`crx.encodedAppId` should be 32 characters long'); // eslint-disable-line no-magic-numbers
		t.strictEqual(crxStream.crx.encodedAppId, 'oldmflkhpnhejcakhabdmkjafmccabek', '`crx.encodedAppId` should match that of "example/example-extension.crx"');
	});

	crxStream.on('close', () => {
		const examplePath = path.join(CWD, 'example', 'example-extension.crx');
		diffCRXFiles(options.crxPath, examplePath, t, `Created "${options.crxPath}" should not differ from "${examplePath}"`)
			.then(() => fs.unlink(options.crxPath, err => t.end(err || null)))
			.catch(err => t.end(err));
	});

	zip.pipe(crxStream);
}

async function diffCRXFiles(crxPath, expectedPath, t, msg) {
	if (FILE_CHECK_DELAY) {
		await new Promise(resolve => setTimeout(resolve, FILE_CHECK_DELAY)); // eslint-disable-line no-magic-numbers
	}

	return tryExec(t, `diff "${crxPath}" "${expectedPath}"`, `Created "${crxPath}" should match "${expectedPath}"`);
}