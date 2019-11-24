const fs = require('fs');
const OS = require('os').platform();

const tryExec = require('./tryExec');

/* eslint-disable require-await,func-name-matching */
const SET_POLICY = {};

SET_POLICY.linux = async function setPolicyLinux (policy) {
	return fs.promises.writeFile('/etc/chromium/policies/managed/crx3-example-extension-test.json', JSON.stringify(policy));
};

SET_POLICY.win32 = async function setPolicyWindows (policy) {
	const fakeT = {
		pass   : console.log,
		comment: console.log,
		error  : console.error
	};

	// https://www.chromium.org/administrators/complex-policies-on-windows
	tryExec(fakeT, `reg add HKLM\\Software\\Policies\\Google\\Chrome /v ExtensionSettings /t REG_SZ /d ${JSON.stringify(policy.ExtensionSettings)} /f`, 'Setting policy in Windows registry should work');
	if (process.env.DEBUG) {
		tryExec(fakeT, 'reg query HKLM\\Software\\Policies\\Google\\Chrome /v ExtensionSettings', 'Registry should contain our test policy');
	}
};

module.exports = SET_POLICY[OS] || null;
/* eslint-enable require-await,func-name-matching */
