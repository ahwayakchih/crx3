#!/usr/bin/env node

const MINIMUM_REQUIRED_NODEJS_VERSION = '12.0.0';

const testVersion = require('../lib/testVersion');
const writeCRX3File = require('../');
const config = require('../lib/configuration')().setFromArgv();
const hasSrcPaths = config.srcPaths && config.srcPaths.length > 0;

/* eslint-disable no-process-exit */
if (!testVersion(process.version.substring(1), MINIMUM_REQUIRED_NODEJS_VERSION)) {
	console.error(`CRX3 requires Node.js version ${MINIMUM_REQUIRED_NODEJS_VERSION} or higher.`);
	process.exit(-1);
}

if (process.stdin.isTTY && !hasSrcPaths) {
	/* eslint-disable prefer-named-capture-group */
	console.log(config
		.helpText()
		.replace(/```sh\n+([\w\W]+?)\n+```/g, (_, sh) => `\u001b[1m${sh}\u001b[0m`)
		.replace(/\*\*([^*]+?)\*\*/g, (_, bold) => `\u001b[7;1m${bold}\u001b[0m`)
		.replace(/\*([^*]+?)\*/g, (_, italic) => `\u001b[1m${italic}\u001b[0m`));
	/* eslint-enable prefer-named-capture-group */
	process.exit();
}

writeCRX3File(process.stdin.isTTY || hasSrcPaths ? config.srcPaths : process.stdin, config)
	.then(options => {
		if (options.newKey) {
			console.log(`Private key file created at "${options.newKey}"`);
		}
		console.log(`CRX file created at "${options.crxPath}"`);
		if (options.zipPath) {
			console.log(`ZIP file created at "${options.zipPath}"`);
		}
		if (options.xmlPath) {
			console.log(`XML file created at "${options.xmlPath}"`);
		}
	})
	.catch(err => {
		console.error(err);
		process.exit(1);
	});
/* eslint-enable no-process-exit */
