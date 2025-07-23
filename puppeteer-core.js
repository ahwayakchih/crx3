const {exec} = require('child_process');
const path = require('path');
const testVersion = require('./lib/testVersion');
const include = require('./test/lib/support/include');

const chromeToPupeteer = [
	/*
	 * This list is updated only when updating module, so very sporadically.
	 * For complete list, see:
	 * https://pptr.dev/supported-browsers#supported-browser-version-list
	 */
	// Chromium version, Last compatible puppeteer version
	['138.0.7204.168', '24.15.0'],
	['138.0.7204.157', '24.14.0'],
	['138.0.7204.94', '24.12.1'],
	['138.0.7204.92', '24.11.2'],
	['138.0.7204.49', '24.11.1'],
	['138.0.7204.49', '24.11.0'],
	['137.0.7151.119', '24.10.2'],
	['137.0.7151.70', '24.10.1'],
	['137.0.7151.55', '24.10.0'],
	['136.0.7103.94', '24.9.0'],
	['136.0.7103.92', '24.8.2'],
	['136.0.7103.49', '24.8.0'],
	['135.0.7049.114', '24.7.2'],
	['135.0.7049.95', '24.7.0'],
	['135.0.7049.84', '24.6.1'],
	['135.0.7049.42', '24.6.0'],
	['134.0.6998.165', '24.5.0'],
	['134.0.6998.35', '24.4.0'],
	['133.0.6943.141', '24.3.1'],
	['133.0.6943.126', '24.3.0'],
	['133.0.6943.98', '24.2.1'],
	['133.0.6943.53', '24.2.0'],
	['132.0.6834.110', '24.1.1'],
	['132.0.6834.83', '24.1.0'],
	['131.0.6778.264', '24.0.0'],
	['131.0.6778.204', '23.11.1'],
	['127.0.6533.88', '22.15.0'],
	['121.0.6167.85', '21.9.0'],
	['115.0.5790.102', '21.0.0'],
	['115.0.5790.98', '20.9.0'],
	['114.0.5735.133', '20.7.2'],
	['112.0.5614.0', '19.8.0'],
	['111.0.5556.0', '19.7.0'],
	['110.0.5479.0', '19.6.0'],
	['109.0.5412.0', '19.4.0'],
	['108.0.5351.0', '19.2.0'],
	['107.0.5296.0', '18.1.0'],
	['106.0.5249.0', '17.1.0'],
	['105.0.5173.0', '15.5.0'],
	['104.0.5109.0', '15.1.0'],
	['103.0.5059.0', '14.2.0'],
	['102.0.5002.0', '14.0.0'],
	['101.0.4950.0', '13.6.0'],
	['100.0.4889.0', '13.5.0'],
	['99.0.4844.16', '13.2.0'],
	['98.0.4758.0', '13.1.0'],
	['97.0.4692.0', '12.0.0'],
	['93.0.4577.0', '11.0.0'],
	['92.0.4512.0', '10.1.0'],
	['91.0.4469.0', '9.1.1'],
	['90.0.4427.0', '8.0.0'],
	['90.0.4403.0', '7.1.0'],
	['89.0.4389.0', '6.0.0'],
	['88.0.4298.0', '5.5.0'],
	['87.0.4272.0', '5.4.1'],
	['86.0.4240.0', '5.3.1'],
	['85.0.4182.0', '5.2.1'],
	['84.0.4147.0', '5.2.0'],
	['62.0.3188.0', '5.0.0']
];

process.once('quit', err => {
	if (err) {
		console.error(err);
	}
	process.exit(err ? -1 : 0); // eslint-disable-line no-process-exit
});

const chrome = process.env.CHROME_BIN || null;
if (!chrome) {
	console.error('No CHROME_BIN specified in environment, exiting.');
	process.exit(-1); // eslint-disable-line no-process-exit
}

exec(`${chrome} --product-version`, (error, stdout) => {
	if (error) {
		process.emit('quit', error);
		return;
	}

	const chromeVersion = stdout.replaceAll(/[\r\n]/g, '');
	var puppeteerVersion = null;

	for (const [targetChromeVersion, maxPuppeteerVersion] of chromeToPupeteer) {
		if (testVersion(chromeVersion, targetChromeVersion)) {
			puppeteerVersion = maxPuppeteerVersion;
			break;
		}
	}

	if (!puppeteerVersion) {
		process.emit('quit', new Error(`Could not find puppeteer-core version compatible with chrome v${chromeVersion}`));
		return;
	}

	const depsToInstall = [`puppeteer-core@${puppeteerVersion}`, 'serve-files'];

	var numOfInstalledDeps = 0;
	for (const dep of depsToInstall) {
		const [name, version] = dep.split('@');
		if (!include(name)) {
			continue;
		}

		// eslint-disable-next-line global-require
		if (version && version !== require(path.join(path.dirname(require.resolve(name)), 'package.json')).version) {
			continue;
		}

		numOfInstalledDeps += 1;
	}

	if (depsToInstall.length <= numOfInstalledDeps) {
		console.log('All dependencies already installed.');
		process.emit('quit');
		return;
	}

	const depsString = depsToInstall.join(' ');
	console.log(`Installing ${depsString}...`);
	exec(`npm install --no-save ${depsString}`, (failure, out, err) => {
		if (failure) {
			console.error(err);
			process.emit('quit', failure);
			return;
		}

		console.log(`Installed ${depsString}`);
		process.emit('quit');
	});
});
