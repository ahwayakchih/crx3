const fs = require('fs');
const OS = require('os').platform();

const tryExec = require('./tryExec');

/* eslint-disable require-await,func-name-matching */
const SET_POLICY = {};

SET_POLICY.linux = async function setPolicyLinux (policy) {
	/**
	 * Allow to override default policies path through `CHROME_POLICIES` set in environment.
	 * Chromium on Linux uses /etc/chromium/policies or /etc/chromium-browser/policies (on Ubuntu?).
	 * Chrome on Linux uses /etc/opt/chrome/policies.
	 */
	const policiesDirectory = process.env.CHROME_POLICIES || '/etc/chromium/policies';
	return fs.promises.writeFile(`${policiesDirectory}/managed/crx3-example-extension-test.json`, JSON.stringify(policy));
};

SET_POLICY.win32 = async function setPolicyWindows (policy) {
	var error = null;
	const fakeT = {
		pass   : console.log,
		comment: console.log,
		error (err) {
			error = err;
			console.error(err);
		}
	};

	// https://www.chromium.org/administrators/complex-policies-on-windows
	var result = tryExec(fakeT, `reg add HKLM\\Software\\Policies\\Google\\Chrome /v ExtensionSettings /t REG_SZ /d ${JSON.stringify(policy.ExtensionSettings)} /f`, 'Setting policy in Windows registry should work');
	if (result && process.env.DEBUG) {
		result = tryExec(fakeT, 'reg query HKLM\\Software\\Policies\\Google\\Chrome /v ExtensionSettings', 'Registry should contain our test policy');
	}

	return result && !error ? Promise.resolve() : Promise.reject(error);
};

module.exports = SET_POLICY[OS] || null;
/* eslint-enable require-await,func-name-matching */
