const fs = require('fs');
const OS = require('os').platform();
const path = require('path');
const test = require('tape-catch');
const testVersion = require('../../lib/testVersion');
const writeCRX3File = require('../../lib/writeCRX3File');

const include = require('./support/include');
const setPolicy = require('./support/setPolicy');
const tryExec = require('./support/tryExec');

const puppeteer = (process.env.CHROME_BIN && include('puppeteer-core')) || include('puppeteer') || null;
const getServer = puppeteer && require('./support/server'); // eslint-disable-line global-require

const CWD = process.cwd();
// Port number should be the same as the one found in `example/example-extension` files.
const PORT = 8080;

const NUMBER_OF_FILES_IN_EXAMPLE_ZIP = 2;
const DEFAULT_FILE_CHECK_DELAY = 1500;
const HTTP_OK = 200;

const FILE_CHECK_DELAY = parseInt(process.env.FILE_CHECK_DELAY || 0, 10) || DEFAULT_FILE_CHECK_DELAY;

test('writeCRX3File', t => {
	t.strictEqual(typeof writeCRX3File, 'function', 'Should export a function');

	t.test('... without args', testWriteCRX3FileWithoutArgs);
	t.test('... without manifest.json', testWriteCRX3FileWithoutManifestJSON);
	t.test('... with both files and options', testWriteCRX3FileWithFilesAndOptions);

	t.end();
});

/* eslint-disable jsdoc/require-jsdoc */
function testWriteCRX3FileWithoutArgs (t) {
	const p = writeCRX3File();
	const crxPath = path.join(CWD, 'web-extension.crx');

	t.strictEqual(typeof p, 'object', 'Should return an object when called without arguments');
	t.strictEqual(p.constructor.name, 'Promise', 'Returned object should be a Promise');

	p
		.then(() => t.fail('Returned promise should not resolve'))
		.catch(() => t.pass('Returned promise should reject'))
		// Delay final test a bit, so CI like appveyor has time to actually add file in file system.
		.finally(() => setTimeout(() => {
			var msg = `Should not create any "${crxPath}" file`;
			try {
				fs.statSync(crxPath);
				t.fail(msg);
			}
			catch (err) {
				t.ok(err, msg);
			}
			t.end();
		}, FILE_CHECK_DELAY));
}

function testWriteCRX3FileWithoutManifestJSON (t) {
	const p = writeCRX3File([__dirname]);
	const crxPath = path.join(CWD, 'web-extension.crx');

	t.strictEqual(typeof p, 'object', 'Should return an object when called with files');
	t.strictEqual(p.constructor.name, 'Promise', 'Returned object should be a Promise');

	p
		.then(() => t.fail('Returned promise should not resolve'))
		.catch(() => t.pass('Returned promise should reject'))
		.finally(() => setTimeout(() => {
			try {
				if (fs.statSync(crxPath).size > 0) {
					throw new Error(`"${crxPath} file is not empty`);
				}
				fs.unlinkSync(crxPath);
			}
			catch (err) {
				t.error(err, `Should create an empty "${crxPath}" file`);
			}
			t.end();
		}, FILE_CHECK_DELAY));
}

function testWriteCRX3FileWithFilesAndOptions (t) {
	const name = `test${process.hrtime.bigint()}`;
	const temp = {
		crx: path.join(CWD, `${name}.crx`),
		zip: path.join(CWD, `${name}.zip`),
		xml: path.join(CWD, `${name}.xml`)
	};

	const manifestPath = path.join(CWD, 'example', 'example-extension', 'manifest.json');
	const utime = 1553470140; // '2019-03-24T23:29:00.000Z'
	try {
		fs.utimesSync(manifestPath, utime, utime);
		fs.utimesSync(path.join(path.dirname(manifestPath), 'example.js'), utime, utime);
		fs.utimesSync(path.dirname(manifestPath), utime, utime);
	}
	catch (err) {
		t.comment('Should be able to change atime and mtime of example paths, to create matchable files');
		t.fail(err);
		t.end();
		return;
	}

	const p = writeCRX3File([manifestPath], {
		crxPath: temp.crx,
		zipPath: temp.zip,
		xmlPath: temp.xml,
		keyPath: path.join(CWD, 'example', 'example-extension.pem'),
		crxURL : `http://127.0.0.1:8080/${path.basename(temp.crx)}`
	});

	t.strictEqual(typeof p, 'object', 'Should return object when called with files and options');
	t.strictEqual(p.constructor.name, 'Promise', 'Returned object should be a Promise');

	p
		.then(cfg => compareWithExample(t, cfg))
		.then(() => t.end())
		.catch(err => t.end(err));
}

function compareWithExample (t, cfg) {
	const examplePath = path.join(CWD, 'example');
	const example = {
		crx: path.join(examplePath, 'example-extension.crx'),
		zip: path.join(examplePath, 'example-extension.zip'),
		xml: path.join(examplePath, 'example-extension.xml')
	};

	t.ok(cfg.appId, 'Promised result should have `appId` set');

	t.ok(cfg.xmlPath, 'Promised result should have `xmlPath` set');
	t.ok(fs.existsSync(cfg.xmlPath), `"${cfg.xmlPath}" file should exist`);
	t.ok(fs.existsSync(example.xml), `"${example.xml}" file should exist`);
	const xmlTest = fs.readFileSync(cfg.xmlPath, {encoding: 'utf8'});
	const xmlExampleTest = fs.readFileSync(example.xml, {encoding: 'utf8'})
		.replace(path.basename(example.crx), path.basename(cfg.crxPath));
	t.strictEqual(xmlTest, xmlExampleTest, `Created "${cfg.xmlPath}" should match "${example.xml}"`);

	t.ok(cfg.zipPath, 'Promised result should have `zipPath` set');
	t.ok(fs.existsSync(cfg.zipPath), `"${cfg.zipPath}" file should exist`);
	t.ok(fs.existsSync(example.zip), `"${example.zip}" file should exist`);
	const zipExample = tryExec(t, `unzip -v ${example.zip}`, `"${example.zip}" file should be a valid ZIP file`)
		.replace(example.zip, '')
		.replace(/\s\d{2}:\d{2}\s/g, ' hh:mm ');
	const selfTest = zipExample.match(/(ad185b2c\s+example.js|f643ef3e\smanifest.json)/); // eslint-disable-line prefer-named-capture-group
	t.ok(selfTest && selfTest.length === NUMBER_OF_FILES_IN_EXAMPLE_ZIP, 'Should pass self-test of unzip output');
	const zipTest = tryExec(t, `unzip -v ${cfg.zipPath}`, `"${cfg.zipPath}" file should be a valid ZIP file`)
		.replace(cfg.zipPath, '')
		.replace(/\s\d{2}:\d{2}\s/g, ' hh:mm ');
	t.strictEqual(zipExample, zipTest, `Created "${cfg.zipPath}" should match "${example.zip}"`);

	t.ok(cfg.crxPath, 'Promised result should have `crxPath` set');
	t.ok(fs.existsSync(cfg.crxPath), `"${cfg.crxPath}" file should exist`);
	t.ok(fs.existsSync(example.crx), `"${example.crx}" file should exist`);

	return doesItWorkInChrome(t, cfg)
		.then(worked => worked || shouldItWorkInChrome(t, cfg, example))
		.then(worked => {
			if (worked) {
				fs.unlinkSync(cfg.xmlPath);
				fs.unlinkSync(cfg.crxPath);
				fs.unlinkSync(cfg.zipPath);
			}
		});
}

/* eslint-disable max-lines-per-function */
async function doesItWorkInChrome (t, cfg) {
	if (!setPolicy) {
		t.skip(`Skipping testing in Chrome because setting up policies is not implemented for ${OS}.`);
		return false;
	}

	if (!process.env.CHROME_BIN && !puppeteer) {
		t.skip('Skipping testing in Chrome because `CHROME_BIN` environment variable is empty.');
		return false;
	}

	if (!puppeteer) {
		t.skip('Skipping testing in Chrome because no `puppeteer` or `puppeteer-core` module is available. Use `npm run puppeteer` command to add it.');
		return false;
	}

	const testServer = await getServer(PORT, cfg);
	if (!testServer) {
		t.skip('Skipping testing in Chrome because test web server could not be started.');
		return false;
	}

	const appId = cfg.appId;
	/*
	 * https://www.chromium.org/administrators/linux-quick-start
	 * http://dev.chromium.org/administrators/policy-list-3#ExtensionInstallForcelist
	 * https://developer.chrome.com/extensions/linux_hosting
	 * https://support.google.com/chrome/a/answer/7517525?hl=en
	 * https://www.chromium.org/administrators/policy-list-3#ExtensionInstallSources
	 * https://www.chromium.org/administrators/configuring-policy-for-extensions
	 */
	const policyError = await setPolicy({
		ExtensionSettings: {
			'*': {
				installation_mode      : 'blocked',
				blocked_install_message: 'Contact IT admin for help.'
			},
			[appId]: {
				installation_mode: 'force_installed',
				update_url       : `${testServer.url}${path.basename(cfg.xmlPath)}`
			}
		}
	})
		.then(() => null)
		.catch(err => err);
	if (policyError) {
		t.skip('Could not install policy');
		testServer.kill();
		return false;
	}

	// Give us time to start browser and wait for it to request CRX file
	const extensionRequested = testServer.waitFor(`/${path.basename(cfg.crxPath)}`);

	/* eslint-disable array-element-newline, multiline-comment-style */
	const browser = await puppeteer.launch({
		headless         : false,
		executablePath   : process.env.CHROME_BIN || null,
		ignoreDefaultArgs: [
			'--headless', // Do not run in headless mode because it disables support for extensions
			'--disable-extensions', // Do not disable extensions when we want to test them ;P
			'--disable-background-networking' // Do not prevent browser from force_installing our stuff
		],
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-gpu',
			'--disable-notifications',
			'--disable-software-rasterizer',
			// '--disable-dev-shm-usage', // This is part of default args
			'--hide-scrollbars',
			'--mute-audio'
			// `--disable-extensions-except=${cfg.crxPath}`, // This is for loading extension from sources, not from CRX file :/
			// `--load-extension=${cfg.crxPath}`, // This is for loading extension from sources, not from CRX file :/
			// '--system-developer-mode', // Run in developer mode
			// `--whitelisted-extension-id ${appId}`, // Adds the given extension ID to all the permission whitelists
		]
	}).catch(console.error);
	/* eslint-enable array-element-newline, multiline-comment-style */

	if (!browser) {
		t.fail('Could not open browser to test extension in it');
		testServer.kill();
		return false;
	}

	// Give browser some time to install our CRX
	const page = await extensionRequested
		.then(status => t.strictEqual(status, HTTP_OK, 'TestServer response to extension request should be 200 OK'))
		.then(() => browser.newPage());

	const browserVersion = await browser.version();
	const extensionXMLRequested = testVersion(browserVersion.replace(/^[\w\W]*\//, ''), '93.0.4577.0')
		? Promise.resolve()
		// Older Chromium seems to request for XML file AGAIN and only after that extension seems to work OK
		: testServer.waitFor(`/${path.basename(cfg.xmlPath)}`, FILE_CHECK_DELAY).catch(() => true);

	await page.goto('http://127.0.0.1:8080/')
		.then(() => extensionXMLRequested)
		// There's some additional delay (for XML parsing?) needed
		.then(() => new Promise(resolve => setTimeout(resolve, FILE_CHECK_DELAY)))
		// Reload page or it won't work
		.then(() => page.reload())
		// Finally! Test if extension was initialized and worked
		.then(() => page.waitForSelector('body[data-id]', {timeout: FILE_CHECK_DELAY})) // eslint-disable-line no-magic-numbers
		.then(() => page.evaluate(() => document.body.getAttribute('data-id'))) // eslint-disable-line no-undef
		.then(foundId => t.strictEqual(foundId, appId, `Extension "${cfg.crxPath}" should work in Chrome/Chromium`))
		// Cleanup
		.catch(t.fail)
		.finally(() => browser.close().catch(console.error) && testServer.kill());

	return Boolean(browser);
}
/* eslint-enable max-lines-per-function */

// If we cannot test in Chrome/Chromium directly, we can try to compare output to `example-extension.crx`` which was tested.
async function shouldItWorkInChrome (t, cfg, example) {
	const {
		crxPath,
		keyPath
	} = cfg;

	// Example ZIP was tested by now, so it should be ok to reuse it.
	const zip = fs.createReadStream(example.zip);
	// Recreate CRX from example ZIP, because ZIP can differ by a few bytes from system to system (possibly uid and gid of files?).
	await writeCRX3File(zip, {crxPath, keyPath});

	if (FILE_CHECK_DELAY) {
		await new Promise(resolve => setTimeout(resolve, FILE_CHECK_DELAY)); // eslint-disable-line no-magic-numbers
	}

	return tryExec(t, `diff "${crxPath}" "${example.crx}"`, `Created "${crxPath}" should match "${example.crx}"`);
}
