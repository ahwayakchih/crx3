const path = require('path');
const createWriteStream = require('fs').createWriteStream;
const yazl = require('yazl');
const crx3stream = require('./crx3stream');
const findCommonPath = require('./findCommonPath');
const getFilePaths = require('./getFilePaths');
const testVersion = require('./testVersion');

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
 * @param {object|module:crx3/lib/configuration} options
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
		var xmlStream = null;

		crxStream.once('error', reject);
		crxStream.once('finish', () => {
			info.appId = crxStream.crx.encodedAppId;
			Object.assign(info, {newKey: crxStream.crx.keys.savedFile}, crxStream.crx.cfg);
			if (crxStream.crx.cfg.xmlPath) {
				xmlStream = writeUpdateManifestXML(crxStream.crx.cfg.xmlPath, crxStream.crx.encodedAppId, {
					version: crxStream.crx.cfg.appVersion,
					url    : crxStream.crx.cfg.crxURL,
					browser: crxStream.crx.cfg.browserVersion
				});
			}
		});
		crxStream.once('close', () => (xmlStream && xmlStream.once('close', () => resolve(info))) || resolve(info));

		zipStream.once('error', reject);
		zipStream.pipe(crxStream);

		if (crxStream.crx.cfg.zipPath) {
			var zipCopyStream = createWriteStream(crxStream.crx.cfg.zipPath);
			zipStream.pipe(zipCopyStream);
		}
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
		const manifestPath = path.join(rootPath, 'manifest.json');

		if (files.indexOf(manifestPath) < 0) {
			crxStream.end(() => reject(new Error(`"${manifestPath}" file is missing`)));
			return;
		}

		const zip = new yazl.ZipFile();
		zip.outputStream.once('error', reject);

		if (crxStream.crx.cfg.xmlPath) {
			const manifestData = require(path.resolve(manifestPath)); // eslint-disable-line global-require
			crxStream.crx.cfg.setFromOptions({
				appVersion    : manifestData.version || crxStream.crx.cfg.appVersion,
				browserVersion: manifestData.minimum_chrome_version || crxStream.crx.cfg.browserVersion
			});
		}

		writeFromZIPStream(crxStream, zip.outputStream)
			.then(resolve)
			.catch(reject);

		files.forEach(file => zip.addFile(file, file.replace(rootPath, '')));

		zip.end();
	});
}

/**
 * Require minimum browser version.
 *
 * Guessed by date when Chromium was switched to generate CRX3 packages (October 16, 2017).
 *
 * Chrome made CRX3 mandatory in version 73.0.3683.
 *
 * @see
 * [Chromium commit]{@link https://chromium.googlesource.com/chromium/src.git/+/b8bc9f99ef4ad6223dfdcafd924051561c05ac75}
 * @see
 * [Chrome version at that commit]{@link https://chromium.googlesource.com/chromium/src/+/b8bc9f99ef4ad6223dfdcafd924051561c05ac75/chrome/VERSION}
 * @see
 * [Chrome version history]{@link https://en.wikipedia.org/wiki/Google_Chrome_version_history}
 * @private
 */
const BROWSER_VERSION_MINIMUM = '64.0.3242';

/**
 * Write Update Manifest template.
 *
 * If browser version is lower than the default, default will be used.
 * That's because older versions may not support CRX3 format anyway.
 *
 * @see
 * [Update Manifest]{@link https://developer.chrome.com/extensions/linux_hosting#update_manifest}
 * @private
 * @param {string} filePath
 * @param {string} appId
 * @param {object} [info]
 * @param {string} [info.version='${APP_VERSION}']
 * @param {string} [info.url='${CRX_URL}']
 * @param {string} [info.browser='64.0.3242']
 */
function writeUpdateManifestXML (filePath, appId, info = {}) {
	info.version = info.version || process.env.APP_VERSION || '${APP_VERSION}';
	info.url = info.url || process.env.CRX_URL || '${CRX_URL}';
	info.browser = info.browser || process.env.BROWSER_VERSION || BROWSER_VERSION_MINIMUM;

	if (!testVersion(info.browser, BROWSER_VERSION_MINIMUM)) {
		info.browser = BROWSER_VERSION_MINIMUM;
	}

	const xmlStream = createWriteStream(filePath);
	xmlStream.end(`<?xml version="1.0" encoding="UTF-8"?>
<gupdate xmlns="http://www.google.com/update2/response" protocol="2.0">
  <app appid="${appId}">
    <updatecheck codebase="${info.url}" version="${info.version}" prodversionmin="${info.browser}" />
  </app>
</gupdate>`);
	return xmlStream;
}
