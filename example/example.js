#!/usr/bin/env node

const crx3 = require('..');

crx3(['example/example-extension/manifest.json'], {
	keyPath: 'example/example-extension.pem',
	crxPath: 'example/example-extension.crx',
	zipPath: 'example/example-extension.zip',
	xmlPath: 'example/example-extension.xml',
	crxURL : 'http://127.0.0.1:8080/example-extension.crx'
})
	.then(() => console.log('done'))
	.catch(console.error)
;
