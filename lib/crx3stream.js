const WriteStream = require('fs').WriteStream;
const crypto = require('crypto');

const PBf = require('pbf');

const crxpb = require('./crx3.pb.js');
const config = require('./configuration');
const keypair = require('./keypair');

/**
 * @module crx3/lib/crx3stream
 */
module.exports = createCRX3Stream;

/**
 * Create and return CRX3Stream.
 *
 * @alias module:crx3/lib/crx3stream
 * @param {string} path        to output file
 * @param {Object} [options]
 * @return {module:crx3/lib/crx3stream.CRX3Stream}
 */
function createCRX3Stream (path, options) {
	return new CRX3Stream(path, options); // eslint-disable-line no-use-before-define
}

/**
 * File write stream
 *
 * @typedef external:fs.WriteStream
 * @see {@link https://nodejs.org/api/fs.html#fs_class_fs_writestream}
 */

/**
 * Extends {@link external:fs.WriteStream} to write additional CRX3 header to output file.
 *
 * Valid CRX file should contain valid ZIP file data. So do not pipe any other type of data
 * to CRX3Stream, or the file will not work in none of Chromium and Google Chrome browsers.
 *
 * @example
 * const crxStream = createCRX3Stream('example/example-extension.crx', {key: true});
 * zipStream.pipe(crxStream);
 *
 * @name module:crx3/lib/crx3stream.CRX3Stream
 * @constructor
 * @extends external:fs.WriteStream
 * @param {string}                               path
 * @param {Object|module:crx3/lib/configuration} [options]
 */
class CRX3Stream extends WriteStream {
	constructor (path, options) {
		if (!options && typeof path === 'object') {
			options = path;
			path = null;
		}

		if (path && typeof path === 'string') {
			options = options || {};
			options.crxPath = path;
		}

		const cfg = config(options);
		super(path || cfg.crxPath, options);

		this.setDefaultEncoding('binary');
		this.pos = this.pos || 0;

		/**
		 * @name module:crx3/lib/crx3stream.CRX3Stream~crx
		 * @type {module:crx3/lib/crx3stream.CRX3StreamState}
		 */
		this.crx = new CRX3StreamState(cfg, this.pos);
	}

	/* eslint-disable no-underscore-dangle */
	_write (chunk, encoding, callback) {
		if (this.crx.error) {
			process.nextTick(callback, this.crx.error);
			return;
		}

		if (!this.crx.sign) {
			this.crxInit(() => this._write(chunk, encoding, callback));
			return;
		}

		this.crx.sign.update(chunk, encoding);
		super._write(chunk, encoding, callback);
	}

	_writev (chunks, callback) {
		if (this.crx.error) {
			process.nextTick(callback, this.crx.error);
			return;
		}

		if (!this.crx.sign) {
			this.crxInit(() => this._writev(chunks, callback));
			return;
		}

		for (var i = 0, max = chunks.length; i < max; i++) {
			this.crx.sign.update(chunks[i].chunk, chunks[i].encoding);
		}

		super._writev(chunks, callback);
	}

	_final (callback) {
		if (this.crx.error) {
			process.nextTick(callback, this.crx.error);
			return;
		}

		this.pos = this.crx.pos;
		super._write(
			createCRXFileHeader(this.crx.keys, this.crx.signedHeaderData, this.crx.sign),
			'binary',
			err => super._final(err2 => {
				callback(err || err2 || null);
				this.crx = null;
			})
		);
	}
	/* eslint-enable no-underscore-dangle */

	/**
	 * @private
	 * @param {Function} callback
	 */
	crxInit (callback) {
		this.crx.keys = keypair(this.crx.cfg.keyPath);
		this.crx.signedHeaderData = createSignedHeaderData(this.crx.keys.publicKey);
		this.crx.sign = createSign(this.crx.signedHeaderData);

		const fauxHeader = createCRXFileHeader(this.crx.keys, this.crx.signedHeaderData, createSign(this.crx.signedHeaderData));
		this.pos = this.crx.pos + fauxHeader.length;
		callback();
	}
}

/**
 * CRX3Stream state object.
 *
 * @name module:crx3/lib/crx3stream.CRX3StreamState
 * @constructor
 * @param {module:crx3/lib/configuration} cfg
 * @param {number}                        [pos=0]
 */
function CRX3StreamState (cfg, pos = 0) {
	/**
	 * @name module:crx3/lib/crx3stream.CRX3StreamState~cfg
	 * @type module:crx3/lib/configuration
	 */
	this.cfg = cfg;
	/**
	 * @private
	 */
	this.pos = pos || 0;
	/**
	 * @name module:crx3/lib/crx3stream.CRX3StreamState~error
	 * @type Error | null
	 */
	this.error = null;
	/**
	 * @name module:crx3/lib/crx3stream.CRX3StreamState~keys
	 * @type module:crx3/lib/createKeyPair.KeyPair
	 */
	this.keys = null;
	/**
	 * @private
	 * @type Uint8Array
	 */
	this.signedHeaderData = null;
	/**
	 * @private
	 * @type external:crypto.Sign
	 */
	this.sign = null;
}

/**
 * CRX IDs are 16 bytes long
 * @private
 * @constant
 */
const CRX_ID_SIZE = 16;

/**
 * CRX3 uses 32bit numbers in various places,
 * so let's prepare size constant for that.
 * @private
 * @constant
 */
const SIZE_BYTES = 4;

/**
 * Used for file format.
 * @see {@link https://github.com/chromium/chromium/blob/master/components/crx_file/crx3.proto}
 * @private
 * @constant
 */
const kSignature = Buffer.from('Cr24', 'utf8');

/**
 * Used for file format.
 * @see {@link https://github.com/chromium/chromium/blob/master/components/crx_file/crx3.proto}
 * @private
 * @constant
 */
const kVersion = Buffer.from([3, 0, 0, 0]); // eslint-disable-line no-magic-numbers

/**
 * Used for generating package signatures.
 * @see {@link https://github.com/chromium/chromium/blob/master/components/crx_file/crx3.proto}
 * @private
 * @constant
 */
const kSignatureContext = Buffer.from('CRX3 SignedData\x00', 'utf8');

/**
 * Given a public key, return CRX ID.
 *
 * @private
 * @param {external:crypto.KeyObject} publicKey
 * @return {Buffer}
 */
function createCrxId (publicKey) {
	var hash = crypto.createHash('sha256');
	hash.update(publicKey.export({
		type  : 'spki',
		format: 'der'
	}));
	return hash.digest().slice(0, CRX_ID_SIZE);
}

/**
 * @private
 * @param {external:crypto.KeyObject} publicKey
 * @return {Uint8Array}
 */
function createSignedHeaderData (publicKey) {
	const pb = new PBf();
	crxpb.SignedData.write({crx_id: createCrxId(publicKey)}, pb);
	return pb.finish();
}

/**
 * Crypto Sign
 *
 * @typedef external:crypto.Sign
 * @see {@link https://nodejs.org/api/crypto.html#crypto_class_sign}
 */

/**
 * Initialize and return a Sign.
 *
 * @private
 * @param {Uint8Array} signedHeaderData
 * @return {external:crypto.Sign}
 */
function createSign (signedHeaderData) {
	var hash = crypto.createSign('sha256');

	// Magic constant
	hash.update(kSignatureContext);

	// Size of signed_header_data
	var sizeOctets = Buffer.allocUnsafe(SIZE_BYTES);
	sizeOctets.writeUInt32LE(signedHeaderData.length, 0);
	hash.update(sizeOctets);

	// Content of signed_header_data
	hash.update(signedHeaderData);

	return hash;
}

/**
 * @private
 * @param {module:crx3/lib/createKeyPair.KeyPair} keyPair
 * @param {Uint8Array}                            signedHeaderData
 * @param {external:crypti.Sign}                  sign               will become unusable after return
 * @return {Buffer}
 */
function createCRXFileHeader (keyPair, signedHeaderData, sign) {
	const pb = new PBf();
	crxpb.CrxFileHeader.write({
		sha256_with_rsa: [
			{
				public_key: keyPair.publicKey.export({
					type  : 'spki',
					format: 'der'
				}),
				signature: Buffer.from(sign.sign(keyPair.privateKey), 'binary')
			}
		],
		signed_header_data: signedHeaderData
	}, pb);

	const header = Buffer.from(pb.finish());
	const size = 0 +
		kSignature.length + // Magic constant
		kVersion.length + // Version number
		SIZE_BYTES + // Header size
		header.length;

	var result = Buffer.allocUnsafe(size);

	var index = 0;
	kSignature.copy(result, index);
	kVersion.copy(result, index += kSignature.length);
	result.writeUInt32LE(header.length, index += kVersion.length);
	header.copy(result, index += SIZE_BYTES);

	return result;
}
