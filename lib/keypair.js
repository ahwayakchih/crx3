const fs = require('fs');
const crypto = require('crypto');

/**
 * @module crx3/lib/createKeyPair
 */
module.exports = createKeyPair;

/**
 * @private
 */
const RSA_KEY_LENGTH = 4096;

/**
 * Crypto module
 *
 * @external crypto
 * @see {@link https://nodejs.org/api/crypto.html}
 */

/**
 * Crypto Key object
 *
 * @typedef external:crypto.KeyObject
 * @see {@link https://nodejs.org/api/crypto.html#crypto_class_keyobject}
 */

/**
 * @typedef module:crx3/lib/createKeyPair.KeyPair
 * @property {external:crypto.KeyObject} privateKey
 * @property {external:crypto.KeyObject} publicKey
 * @property {string|null}               savedFile
 */

/**
 * Read private key from a file, if available.
 *
 * If not found, create a new one.
 *
 * @alias module:crx3/lib/createKeyPair
 * @param {string} [keyPath='']   pointing to private key file
 * @return {module:crx3/lib/createKeyPair.KeyPair}
 */
function createKeyPair (keyPath = '') {
	if (!keyPath) {
		return createNewKeyPair(keyPath);
	}

	var keyPair = tryLoadKeyPair(keyPath);

	if (keyPair.privateKey && keyPair.publicKey) {
		return keyPair;
	}
	else if (keyPath && fs.existsSync(keyPath)) {
		console.error(`"${keyPath}" already exists but could not be loaded.`);
		console.error(keyPair);
		return null;
	}

	return createNewKeyPair(keyPath);
}

/**
 * Try to safely load data from private key file.
 *
 * @private
 * @param {string} keyPath
 * @return {external:crypto.KeyObject|Error}
 */
function tryLoadKeyPair (keyPath) {
	try {
		const data = fs.readFileSync(keyPath);
		return {
			privateKey: crypto.createPrivateKey(data),
			publicKey : crypto.createPublicKey(data),
			savedFile : null
		};
	}
	catch (e) {
		return e;
	}
}

/**
 * Generate new pair of keys and save private key to file.
 *
 * @private
 * @param {string} keyPath
 */
function createNewKeyPair (keyPath) {
	const pair = crypto.generateKeyPairSync('rsa', {modulusLength: RSA_KEY_LENGTH});
	pair.savedFile = null;

	if (!keyPath) {
		console.warn('No `keyPath` was specified. Private key will not be saved to a file.');
		return pair;
	}

	const privateKeyData = pair.privateKey.export({
		type  : 'pkcs8',
		format: 'pem'
	});

	try {
		fs.writeFileSync(keyPath, privateKeyData);
		pair.savedFile = keyPath;
	}
	catch (e) {
		console.error(`Could not write "${keyPath}" file.`);
		console.error(e);
	}

	return pair;
}
