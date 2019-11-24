const exec = require('child_process').execSync;

module.exports = function tryExec (t, cmd, msg) {
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
};
