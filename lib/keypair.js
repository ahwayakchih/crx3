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
		console.warn('No `keyPath` was specified. Private key will not be loaded from or saved to a file.');
	}
	else if (fs.existsSync(keyPath)) {
		const keyPair = tryLoadKeyPair(keyPath);
		if (!keyPair) {
			throw new Error(`"${keyPath}" already exists but could not be loaded.`);
		}
		return keyPair;
	}

	const keyPair = crypto.generateKeyPairSync('rsa', {modulusLength: RSA_KEY_LENGTH});

	if (keyPath) {
		trySaveKeyPair(keyPath, keyPair);
	}

	return keyPair;
}

/**
 * Try to safely load data from private key file.
 *
 * @private
 * @param {string} keyPath
 * @return {external:crypto.KeyObject|null}
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
		console.error(`Could not load key from "${keyPath}"`);
		console.error(e);
	}
	return null;
}

/**
 * Try to safely save private key to file.
 *
 * @private
 * @param {string} keyPath
 * @param {module:crx3/lib/createKeyPair.KeyPair} keyPair
 */
function trySaveKeyPair (keyPath, keyPair) {
	keyPair.savedFile = null;

	const privateKeyData = keyPair.privateKey.export({
		type  : 'pkcs8',
		format: 'pem'
	});

	try {
		fs.writeFileSync(keyPath, privateKeyData);
		keyPair.savedFile = keyPath;
	}
	catch (e) {
		console.error(`Could not write "${keyPath}" file.`);
		console.error(e);
	}
}
