const {exec} = require('child_process');
const path = require('path');
const testVersion = require('./lib/testVersion');
const include = require('./test/lib/support/include');

const chromeToPupeteer = [
	// Chromium version, Last compatible puppeteer version
	['97.0.4692.0', '12.0.0'],
	['93.0.4577.0', '11.0.0'],
	['92.0.4512.0', '10.1.0'],
	['91.0.4469.0', '9.1.1'],
	['90.0.4427.0', '8.0.0']
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
