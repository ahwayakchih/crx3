const readFileSync = require('fs').readFileSync;
const path = require('path');
const mri = require('mri');

/**
 * @module module:crx3/lib/configuration
 */

/**
 * Create Configuration object and set its properties.
 *
 * @alias module:crx3/lib/configuration
 * @param {object} [options]
 * @return {module:crx3/lib/configuration.Configuration}
 */
module.exports = function createConfiguration (options) {
	var config = new Configuration();
	if (options && typeof options === 'object') {
		config.setFromOptions(options);
	}
	return config;
};

/**
 * @private
 */
const NUMBER_OF_IGNORED_CLI_ARGS = 2;

/**
 * @private
 */
const CWD = process.env.PWD || process.cwd();

/**
 * @private
 */
const DEFAULT_CRX_PATH = path.join(CWD, 'web-extension.crx');

/**
 * @private
 */
const DEFAULT_ZIP_PATH = path.join(CWD, 'web-extension.zip');

/**
 * @private
 */
const DEFAULT_KEY_PATH = path.join(CWD, 'web-extension.pem');

/**
 * @private
 */
const DEFAULT_XML_PATH = path.join(CWD, 'web-extension.xml');

/**
 * @example
 * const config = require('crx/lib/configuration');
 * var options = config();
 *
 * @name module:crx3/lib/configuration.Configuration
 * @constructor
 */
function Configuration () {
	/**
	 * Name used for files, if they are not specified otherwise.
	 * @type string
	 */
	this.name = '';
	/**
	 * Path name of output CRX file.
	 * @type string
	 * @default './web-extension.crx'
	 */
	this.crxPath = DEFAULT_CRX_PATH;
	/**
	 * Optional path name of output ZIP file.
	 * @type string
	 * @default ''
	 */
	this.zipPath = '';
	/**
	 * Private key to be used for signing CRX file.
	 * @type string
	 * @default ''
	 */
	this.keyPath = '';
	/**
	 * Optional path name of output Update Manifest XML file.
	 * @type string
	 * @default ''
	 */
	this.xmlPath = '';
	/**
	 * Optional version name to be written into Upate Manifest file.
	 * @type string
	 * @default undefined
	 */
	this.appVersion = undefined; // eslint-disable-line no-undefined
	/**
	 * Optional extension file URL name to be written into Upate Manifest file.
	 * @type string
	 * @default undefined
	 */
	this.crxURL = undefined; // eslint-disable-line no-undefined
	/**
	 * Optional minimum supported browser version name, e.g., '70.0.0'
	 * @type string
	 * @default undefined
	 */
	this.browserVersion = undefined; // eslint-disable-line no-undefined
	/**
	 * List of paths to include.
	 * @type string[]
	 * @default []
	 */
	this.srcPaths = [];
}

/**
 * Parse command line arguments and apply them as options.
 *
 * @return {Configuration} this
 */
Configuration.prototype.setFromArgv = function setFromArgv () {
	const argv = mri(process.argv.slice(NUMBER_OF_IGNORED_CLI_ARGS), {
		alias: {
			crxPath: ['o', 'crx'],
			zipPath: ['z', 'zip'],
			keyPath: ['p', 'key'],
			xmlPath: ['x', 'xml']
		}
	});

	if (Array.isArray(argv._) && argv._.length > 0) {
		this.srcPaths = argv._.slice();
	}

	return this.setFromOptions(argv);
};

/**
 * Pick properties from target options object if their name matches supported option.
 *
 * @param {object} options
 * @return {Configuration} this
 */
Configuration.prototype.setFromOptions = function setFromOptions (options = {}) {
	Object.keys(this).forEach(key => {
		this[key] = Reflect.has(options, key) ? options[key] : this[key];
	});

	return this.sanitize();
};

/**
 * Make sure that option values are of correct type, converting them when needed.
 *
 * return {Configuration} this
 */
Configuration.prototype.sanitize = function sanitize () {
	if (!this.name) {
		if (this.srcPaths.length === 1 && path.extname(this.srcPaths[0]) === '') {
			this.name = path.basename(this.srcPaths[0]);
		}
		else if (this.srcPaths.length > 0) {
			var manifest = this.srcPaths.filter(p => path.basename(p) === 'manifest.json');
			if (manifest.length === 1) {
				this.name = path.basename(path.dirname(manifest[0]));
			}
		}
	}

	this.sanitizePath('crxPath', 'crx', DEFAULT_CRX_PATH);
	this.sanitizePath('zipPath', 'zip', DEFAULT_ZIP_PATH);
	this.sanitizePath('keyPath', 'pem', DEFAULT_KEY_PATH);
	this.sanitizePath('xmlPath', 'xml', DEFAULT_XML_PATH);

	this.crxPath = path.resolve(CWD, this.crxPath);

	return this;
};

/**
 * Set path name based on this.name or default value.
 * But only if property is already non-empty.
 * Otherwise leave it empty.
 *
 * @private
 * @param {string} property    property name, e.g., 'zipPath'
 * @param {string} extension   file extension, e.g., 'zip'
 * @param {string} fallback    value to use by default, e.g., '${process.env.PWD}/web-extension.zip'
 */
Configuration.prototype.sanitizePath = function sanitizePath (property, extension, fallback) {
	if (this[property] === true || this[property] === fallback) {
		this[property] = this.name ? `${this.name}.${extension}` : fallback;
	}

	if (this[property]) {
		this[property] = path.resolve(CWD, this[property]);
	}
};

/**
 * Return a "help text", suitable to output in CLI environment.
 *
 * @return {string}
 */
Configuration.prototype.helpText = function helpText () {
	const name = path.basename(require.main.filename);
	const readmePath = path.join(path.dirname(__dirname), 'README.md');
	const readme = readFileSync(readmePath, 'utf8');
	const readmeCLI = readme.match(/[#]+ Usage \(CLI\)\n(?<usage>[\w\W]+?)\n+[#]+/);
	const usage = (readmeCLI && readmeCLI.groups.usage)
		|| `Read ${readmePath} for more information.`;

	return `Usage: ${name} [-o [path]] [-k [path]] [-z [path]] [-x [path]] directoryOrManifest

${usage}`;
};
