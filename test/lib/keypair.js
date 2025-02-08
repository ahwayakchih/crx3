const fs = require('fs');
const test = require('tape-catch');
const keypair = require('../../lib/keypair');

test('keypair', t => {
	t.strictEqual(typeof keypair, 'function', 'Should export a function');

	const pair = keypair();
	t.strictEqual(typeof pair, 'object', 'Should create an object');

	t.ok(pair.privateKey, 'Pair should contain `privateKey`');
	t.strictEqual(typeof pair.privateKey, 'object', '`privateKey` should be an object');
	t.strictEqual(pair.privateKey.constructor.name, 'PrivateKeyObject', 'Private key should be an instance of PrivateKeyObject');

	t.ok(pair.publicKey, 'Pair should contain `publicKey`');
	t.strictEqual(typeof pair.publicKey, 'object', '`publicKey` should be an object');
	t.strictEqual(pair.publicKey.constructor.name, 'PublicKeyObject', 'Public key should be an instance of PublicKeyObject');

	const keyPath = './test.pem';
	if (fs.existsSync(keyPath)) {
		fs.unlinkSync(keyPath);
	}

	const pair2 = keypair(keyPath);
	t.ok(fs.existsSync(keyPath), 'Should save private key file, if it did not exist');
	t.strictEqual(pair2.savedFile, keyPath, 'Should set `savedFile` to keyPath when file was created');

	const pair3 = keypair(keyPath);
	const privateOptions = {
		type  : 'pkcs8',
		format: 'pem'
	};
	t.strictEqual(pair2.privateKey.export(privateOptions), pair3.privateKey.export(privateOptions), 'Should load previously created private key');
	t.strictEqual(pair3.savedFile, null, 'Should not set `savedFile` if file was not created');
	const publicOptions = {
		type  : 'spki',
		format: 'pem'
	};
	t.strictEqual(pair2.publicKey.export(publicOptions), pair3.publicKey.export(publicOptions), 'Should have the same public key as before');

	if (fs.existsSync(keyPath)) {
		fs.unlinkSync(keyPath);
	}

	let mask = process.umask(0o000);
	const failPath = 'forbidden';
	const writeOnly = 0o200;
	fs.writeFileSync(failPath, '', {mode: writeOnly});
	process.umask(mask);
	const fail = keypair(failPath);
	t.strictEqual(fail, null, 'Should return `null` if key file exists but could not be read');
	fs.unlinkSync(failPath);

	mask = process.umask(0o000);
	const failDirPath = 'forbidden';
	const readOnly = 0o400;
	fs.mkdir(failDirPath, {mode: readOnly}, (err) => {
		process.umask(mask);
		t.strictEqual(err, null, 'Should be able to create directory for testing');
		const failKeyPath = failDirPath + '/test';
		const failWriteDir = keypair(failKeyPath);
		t.strictEqual(fail, null, 'Should return `null` if key file exists but could not be read');
		fs.rmdir(failDirPath, () => {
			// We ignore possible error when trying to remove test directory
			t.end();
		});
	});
});
