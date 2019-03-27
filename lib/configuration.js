const path = require('path');
const mri = require('mri');

/**
 * @module module:crx3/lib/configuration
 */

/**
 * Create Configuration object and set its properties.
 *
 * @alias module:crx3/lib/configuration
 * @param {Object} [options]
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
	this.appVersion = undefined;
	/**
	 * Optional extension file URL name to be written into Upate Manifest file.
	 * @type string
	 * @default undefined
	 */
	this.crxURL = undefined;
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
 * @param {Object} options
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

	if (this.name && (!this.crxPath || this.crxPath === true || this.crxPath === DEFAULT_CRX_PATH)) {
		this.crxPath = `${this.name}.crx`;
	}

	this.crxPath = path.resolve(CWD, this.crxPath || DEFAULT_CRX_PATH);

	if (this.name && (this.zipPath === true || this.zipPath === DEFAULT_ZIP_PATH)) {
		this.zipPath = `${this.name}.zip`;
	}

	if (this.zipPath) {
		this.zipPath = path.resolve(CWD, this.zipPath === true ? DEFAULT_ZIP_PATH : this.zipPath);
	}

	if (this.name && (this.keyPath === true || this.keyPath === DEFAULT_KEY_PATH)) {
		this.keyPath = `${this.name}.pem`;
	}

	if (this.keyPath) {
		this.keyPath = path.resolve(CWD, this.keyPath === true ? DEFAULT_KEY_PATH : this.keyPath);
	}

	if (this.name && (this.xmlPath === true || this.xmlPath === DEFAULT_ZIP_PATH)) {
		this.xmlPath = `${this.name}.xml`;
	}

	if (this.xmlPath) {
		this.xmlPath = path.resolve(CWD, this.xmlPath === true ? DEFAULT_XML_PATH : this.xmlPath);
	}

	return this;
};

/**
 * Return a "help text", suitable to output in CLI environment.
 *
 * @return {string}
 */
Configuration.prototype.helpText = function helpText () {
	const name = path.basename(require.main.filename);

	return `Usage: ${name} [-o [path]] [-k [path]] [-z [path]] [-x [path]] directoryOrManifest

Options:

  -o, --crx, --crxPath: create CRX file at specified path
  -k, --key, --keyPath: read from or create private key file at specified path
  -z, --zip, --zipPath: create ZIP file too
  -x, --xml, --xmlPath: create XML file (Update Manifest) too
  --crxURL            : URL to write into Update Manifest file
  --appVersion        : Version to write into Update Manifest file

If option is not followed by a path/name, file name will be based on the web extension's directory name.

Private key file will not be created if one already exist. In such case, existing one will be used.
CRX and ZIP files are always overwritten.

Examples:

  ${name} -k -z -- web-extension/manifest.json

or

  ${name} -k -z -- web-extension/

It will create "web-extension.crx", "web-extension.pem" and "web-extension.zip" files.
If "web-extension.pem" already exists, it will be used instead of creating new one.

  ${name} -k -z backup.zip web-extension/manifest.json
  
  or
  
  ${name} -k -z backup.zip web-extension/
  
It will create "web-extension.crx", "web-extension.pem" and "backup.zip" files.

  cat your-web-extension.zip | ${name} -p

It will read existing ZIP file contents and create "web-extenstion.crx" and "web-extension.pem" files.
Make sure that ZIP file content has no parent directory, e.g., "manifest.json" file
has to be there, not "web-extension/manifest.json", or result CRX file will not work in browser.

You can also create ZIP file on the fly, and pass it like this:

  zip -r -9 -j - web-extension | ${name} -p
`;
};
