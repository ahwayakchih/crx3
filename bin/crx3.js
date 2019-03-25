#!/usr/bin/env node

const writeCRX3File = require('../');
const config = require('../lib/configuration')().setFromArgv();

/* eslint-disable no-process-exit */
if (process.stdin.isTTY && (!config.srcPaths || config.srcPaths.length < 1)) {
	console.log(config.helpText());
	process.exit();
}

writeCRX3File(process.stdin.isTTY ? config.srcPaths : process.stdin, config)
	.then(options => {
		if (options.newKey) {
			console.log(`Private key file created at "${options.newKey}"`);
		}
		console.log(`CRX file created at "${options.crxPath}"`);
		if (options.zipPath) {
			console.log(`ZIP file created at "${options.zipPath}"`);
		}
	})
	.catch(err => {
		console.error(err);
		process.exit(1);
	});
/* eslint-enable no-process-exit */