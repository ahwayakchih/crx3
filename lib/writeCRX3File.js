const createWriteStream = require('fs').createWriteStream;
const yazl = require('yazl');
const crx3stream = require('./crx3stream');
const findCommonPath = require('./findCommonPath');
const getFilePaths = require('./getFilePaths');

/**
 * @module crx3/lib/writeCRX3File
 */

/**
 * Stream module
 *
 * @external stream
 * @see {@link https://nodejs.org/api/stream.html}
 */

/**
 * Readable stream
 *
 * @typedef external:stream.Readable
 * @see {@link https://nodejs.org/api/stream.html#stream_class_stream_readable}
 */

/**
 * Create CRX package from specified files.
 *
 * Private key file will not be created if one already exist. In such case, existing one will be used.
 * CRX and ZIP files are always overwritten.
 *
 * @alias module:crx3/lib/writeCRX3File
 * @param {string[]|external:stream.Readable}    files
 * @param {Object|module:crx3/lib/configuration} options
 * @return {Promise}
 */
module.exports = function writeCRX3File (files, options) {
	if (!options && typeof files === 'object' && !Array.isArray(files)) {
		options = files;
		files = null;
	}

	if ((!files || files.length < 1) && !options) {
		return Promise.reject(new Error('No files found'));
	}

	var crxStream = crx3stream(options);

	if (typeof files === 'object' && typeof files.pipe === 'function') {
		return writeFromZIPStream(crxStream, files);
	}

	if (!files || files.length < 1) {
		files = crxStream.crx.cfg.srcPaths;
	}

	files = getFilePaths(files);

	if (!files || files.length < 1) {
		return Promise.reject(new Error('No files found'));
	}

	return writeFromListOfFiles(crxStream, files);
};

/**
 * @private
 * @param {external:fs.WriteStream}  crxStream
 * @param {external:stream.Readable} zipStream
 * @return {Promise}
 */
function writeFromZIPStream (crxStream, zipStream) {
	return new Promise((resolve, reject) => {
		var info = {};

		crxStream.once('error', reject);
		crxStream.once('finish', () => Object.assign(info, {newKey: crxStream.crx.keys.savedFile}, crxStream.crx.cfg));
		crxStream.once('close', () => resolve(info));

		zipStream.once('error', reject);
		zipStream.pipe(crxStream);
	});
}

/**
 * @private
 * @param {external:fs.WriteStream} crxStream
 * @param {string[]}                files
 * @return {Promise}
 */
function writeFromListOfFiles (crxStream, files) {
	return new Promise((resolve, reject) => {
		const rootPath = findCommonPath(files);
		var info = {};

		crxStream.once('error', reject);
		crxStream.once('finish', () => Object.assign(info, {newKey: crxStream.crx.keys.savedFile}, crxStream.crx.cfg));
		crxStream.once('close', () => resolve(info));

		const zip = new yazl.ZipFile();
		zip.outputStream.once('error', reject);
		zip.outputStream.pipe(crxStream);

		if (crxStream.crx.cfg.zipPath) {
			zip.outputStream.pipe(createWriteStream(crxStream.crx.cfg.zipPath));
		}

		files.forEach(file => zip.addFile(file, file.replace(rootPath, '')));

		zip.end();
	});
}
