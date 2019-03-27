const fs = require('fs');
const path = require('path');
const exec = require('child_process').execSync;
const test = require('tape-catch');
const writeCRX3File = require('../../lib/writeCRX3File');

const CWD = process.cwd();

test('writeCRX3File', t => {
	t.strictEqual(typeof writeCRX3File, 'function', 'Should export a function');

	t.test('... without args', testWriteCRX3FileWithoutArgs);
	t.test('... with both files and options', testWriteCRX3FileWithFilesAndOptions);

	t.end();
});

function testWriteCRX3FileWithoutArgs (t) {
	const p = writeCRX3File();

	t.strictEqual(typeof p, 'object', 'Should return object when called without arguments');
	t.strictEqual(p.constructor.name, 'Promise', 'Returned object should be a Promise');

	p
		.then(() => t.fail('Returned promise should not resolve'))
		.catch(() => t.pass('Returned promise should reject'))
		.finally(() => t.end());
}

function testWriteCRX3FileWithFilesAndOptions (t) {
	const name = `test${process.hrtime.bigint()}`;
	const temp = {
		crx: path.join(CWD, `${name}.crx`),
		zip: path.join(CWD, `${name}.zip`)
	};

	const p = writeCRX3File([path.join(CWD, 'example', 'example-extension', 'manifest.json')], {
		crxPath: temp.crx,
		zipPath: temp.zip,
		keyPath: path.join(CWD, 'example', 'example-extension.pem')
	});

	t.strictEqual(typeof p, 'object', 'Should return object when called with files and options');
	t.strictEqual(p.constructor.name, 'Promise', 'Returned object should be a Promise');

	p
		.then(cfg => compareWithExample(t, cfg))
		.catch(err => t.end(err));
}

function compareWithExample (t, cfg) {
	const examplePath = path.join(CWD, 'example');
	const example = {
		crx: path.join(examplePath, 'example-extension.crx'),
		zip: path.join(examplePath, 'example-extension.zip')
	};

	t.ok(cfg.zipPath, 'Promised result should have `zipPath` set');
	t.ok(fs.existsSync(cfg.zipPath), `"${cfg.zipPath}" file should exist`);
	t.ok(fs.existsSync(example.zip), `"${example.zip}" file should exist`);
	t.strictEqual(tryExec(`unzip -l ${cfg.zipPath}`), null, `"${cfg.zipPath}" file should be a valid ZIP file`);

	t.ok(cfg.crxPath, 'Promised result should have `crxPath` set');
	t.ok(fs.existsSync(cfg.crxPath), `"${cfg.crxPath}" file should exist`);
	t.ok(fs.existsSync(example.crx), `"${example.crx}" file should exist`);

	t.strictEqual(tryExec(`diff "${cfg.zipPath}" "${example.zip}"`), null, `Created "${cfg.zipPath}" should not differ from "${example.zip}"`);
	fs.unlinkSync(cfg.zipPath);

	t.strictEqual(tryExec(`diff "${cfg.crxPath}" "${example.crx}"`), null, `Created "${cfg.crxPath}" should not differ from "${example.crx}"`);
	fs.unlinkSync(cfg.crxPath);

	t.end();
}

function tryExec (cmd) {
	try {
		exec(cmd);
		return null;
	}
	catch (err) {
		return err;
	}
}