const fs = require('fs');
const OS = require('os').platform();
const http = require('http');
const path = require('path');
const exec = require('child_process').execSync;
const test = require('tape-catch');
const writeCRX3File = require('../../lib/writeCRX3File');

const puppeteer = (process.env.CHROME_BIN && include('puppeteer-core')) || include('puppeteer') || null;
const serveFiles = puppeteer && include('serve-files');

const CWD = process.cwd();
// Port number should be the same as the one found in `example/example-extension` files.
const PORT = 8080;

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
		.finally(() => {
			var msg = `Should not create any "${crxPath}" file`;
			try {
				fs.statSync(crxPath);
				t.fail(msg);
			}
			catch (err) {
				t.ok(err, msg);
			}
			t.end();
		});
}

function testWriteCRX3FileWithoutManifestJSON (t) {
	const p = writeCRX3File([__dirname]);
	const crxPath = path.join(CWD, 'web-extension.crx');

	t.strictEqual(typeof p, 'object', 'Should return an object when called with files');
	t.strictEqual(p.constructor.name, 'Promise', 'Returned object should be a Promise');

	p
		.then(() => t.fail('Returned promise should not resolve'))
		.catch(() => t.pass('Returned promise should reject'))
		.finally(() => {
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
		});
}

function testWriteCRX3FileWithFilesAndOptions (t) {
	const name = `test${process.hrtime.bigint()}`;
	const temp = {
		crx: path.join(CWD, `${name}.crx`),
		zip: path.join(CWD, `${name}.zip`),
		xml: path.join(CWD, `${name}.xml`)
	};

	const manifestPath = path.join(CWD, 'example', 'example-extension', 'manifest.json');
	const utime = new Date('2019-03-24T23:29:00.000Z');
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
	const zipExample = tryExec(t, `unzip -v ${example.zip}`, `"${example.zip}" file should be a valid ZIP file`).replace(example.zip, '');
	const zipTest = tryExec(t, `unzip -v ${cfg.zipPath}`, `"${cfg.zipPath}" file should be a valid ZIP file`).replace(cfg.zipPath, '');
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

function tryExec (t, cmd, msg) {
	try {
		var margin = ' '.padStart(t._objectPrintDepth || 0, '.'); // eslint-disable-line no-underscore-dangle
		var stdout = exec(cmd);
		t.pass(msg);
		if (stdout && stdout.length > 0) {
			stdout = stdout.toString('utf8');
			t.comment(margin + stdout.replace(/\n+/g, '\n' + margin)); // eslint-disable-line prefer-template
			return stdout || true;
		}
		return true;
	}
	catch (err) {
		t.error((err.stderr && err.stderr.toString('utf8'))
			|| (err.stdout && err.stdout.toString('utf8'))
			|| err.message, msg);
		return false;
	}
}

function initTestServer (xmlPath) {
	const HTTP_OK = 200;

	const fileResponse = serveFiles && serveFiles.createFileResponseHandler({
		followSymbolicLinks: false,
		documentRoot       : process.cwd()
	});

	const server = fileResponse && http.createServer((req, res) => {
		if (process.env.DEBUG) {
			console.log(`TEST SERVER CALLED FOR ${req.url}`, req.headers);
		}

		/*
		 * Our test extension's manifest file points to example file,
		 * so, just in case Chrome tries to access it, redirect it to a test-generated file.
		 */
		if (req.url.startsWith('/example-extension.xml')) {
			req.url = `/${xmlPath}`;
		}

		if (req.url !== '/') {
			fileResponse(req, res);
			return;
		}

		const html = Buffer.from('<html><head><title>Test page</title></head><body>Test content</body></html>', 'utf8');
		res.writeHead(HTTP_OK, 'OK', {
			'Content-Type'  : 'text/html; charset=utf-8',
			'Content-Length': html.length
		});
		res.end(html);
	});

	return server && new Promise(resolve => {
		server.listen(PORT, '127.0.0.1', () => {
			server.url = `http://127.0.0.1:${server.address().port}/`;
			if (process.env.DEBUG) {
				console.log(`TEST SERVER LISTENING at ${server.url} with docroot set to ${process.cwd()}`);
			}
			resolve(server);
		});
	});
}

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
		t.skip('Skipping testing in Chrome because no `puppeteer` or `puppeteer-core` module is available.');
		return false;
	}

	const testServer = await initTestServer(path.basename(cfg.xmlPath));
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
	const testPolicy = {
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
	};

	await setPolicy(testPolicy);

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

	// Give browser some time to install our CRX
	await new Promise(resolve => setTimeout(resolve, 2000)); // eslint-disable-line no-magic-numbers

	const page = browser && await browser.newPage();
	const data = page && await page.goto('http://127.0.0.1:8080/')
		.then(() => page.waitForSelector('body[data-name]', {timeout: 3000})) // eslint-disable-line no-magic-numbers
		.then(() => page.evaluate(() => document.body.getAttribute('data-id'))) // eslint-disable-line no-undef
		.catch(t.fail);

	if (browser) {
		t.strictEqual(data, appId, `Extension "${cfg.crxPath}" should work in Chrome/Chromium`);
		await browser.close().catch(console.error);
	}
	else {
		t.skip('Could not open browser to test extension in it');
	}

	testServer.close();

	return true;
}

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

	return tryExec(t, `diff "${crxPath}" "${example.crx}"`, `Created "${crxPath}" should match "${example.crx}"`);
}

function include (name) {
	var result = null;
	try {
		result = require(name); // eslint-disable-line global-require
	}
	catch (err) {
		// Ignore error.
		result = null;
	}

	return result;
}


const SET_POLICY = {};

SET_POLICY.linux = async function setPolicyLinux (policy) {
	return await fs.promises.writeFile('/etc/chromium/policies/managed/crx3-example-extension-test.json', JSON.stringify(policy));
}

SET_POLICY.win32 = async function setPolicyWindows (policy) {
	const fakeT = {
		pass   : console.log,
		comment: console.log,
		error  : console.error
	};
	// https://www.chromium.org/administrators/complex-policies-on-windows
	tryExec(fakeT, 'reg add HKLM\\Software\\Policies\\Google\\Chrome /v ExtensionSettings /t REG_SZ /d ' + JSON.stringify(policy.ExtensionSettings) + ' /f', 'Setting policy in Windows registry should work');
	if (process.env.DEBUG) {
		tryExec(fakeT, 'reg query HKLM\\Software\\Policies\\Google\\Chrome /v ExtensionSettings', 'Registry should contain our test policy');
	}
}

const setPolicy = SET_POLICY[OS] || null;
