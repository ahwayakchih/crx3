const http = require('http');
const path = require('path');
const fork = require('child_process').fork;
const serveFiles = require('serve-files');

module.exports = function getServer (port, cfg) {
	if (process.env.DEBUG) {
		console.log('Spawning a test server');
	}

	return new Promise(resolve => {
		const server = fork(module.filename, {
			env: Object.assign({}, process.env, {
				PORT: port,
				ROOT: path.dirname(cfg.xmlPath),
				XML : path.basename(cfg.xmlPath),
				CRX : path.basename(cfg.crxPath)
			})
		});
		server.on('message', message => {
			switch (message.action) {
				case 'ready':
					server.url = message.url;
					server.cwd = message.cwd;
					if (process.env.DEBUG) {
						console.log(`TEST SERVER listening at ${server.url}, serving files from ${message.cwd}`);
					}
					resolve(server);
					break;
				case 'request':
					if (process.env.DEBUG) {
						console.log(`TEST SERVER request for ${message.url}`, message.headers);
					}
					break;
				case 'response':
					if (process.env.DEBUG) {
						console.log(`TEST SERVER response for ${message.url}`, message);
					}
					break;
				default:
					if (process.env.DEBUG) {
						console.log('TEST SERVER info', message);
					}
					break;
			}
		});
		server.on('error', error => console.error('Server error', error));
		server.on('exit', (code, signal) => process.env.DEBUG && console.log('Server exited', code, signal));
		server.waitFor = function waitFor (requestPath, timeout = 0) {
			return new Promise((ok, fail) => {
				const listener = message => {
					if (message.action !== 'response') {
						return;
					}
					if (message.requestPath !== requestPath) {
						return;
					}

					server.off('message', listener);
					ok(message.status);
				};
				server.on('message', listener);
				if (timeout) {
					setTimeout(() => {
						server.off('message', listener);
						fail(new Error('Timeout'));
					}, timeout);
				}
			});
		};
	});
};

/**
 * @private
 * @param {string} root path
 * @param {number} port
 * @param {object} fileMap
 */
function initTestServer (root, port, fileMap) {
	const HTTP_OK = 200;

	const fileResponse = serveFiles && serveFiles.createFileResponseHandler({
		followSymbolicLinks: false,
		documentRoot       : root
	});

	const server = fileResponse && http.createServer((req, res) => {
		process.send({
			action : 'request',
			url    : req.url,
			headers: req.headers
		});

		var requestPath = req.url.replace(/\?[\w\W]*$/, '');
		var mappedFile = fileMap[requestPath] || null;
		if (mappedFile) {
			req.url = mappedFile;
		}

		if (req.url !== '/') {
			fileResponse(req, res, () => {
				process.send({
					action : 'response',
					url    : req.url,
					status : res.statusCode,
					headers: res.getHeaders(),
					mappedFile,
					requestPath
				});
			});
			return;
		}

		const html = Buffer.from('<html><head><title>Test page</title></head><body>Test content</body></html>', 'utf8');
		res.writeHead(HTTP_OK, 'OK', {
			'Content-Type'  : 'text/html; charset=utf-8',
			'Content-Length': html.length
		});
		res.end(html);
	});

	server.listen(port, '0.0.0.0', () => {
		server.url = `http://127.0.0.1:${server.address().port}/`;
		process.send({
			action: 'ready',
			url   : server.url,
			cwd   : process.cwd()
		});
	});
}

if (require.main === module && typeof process.send === 'function') {
	initTestServer(process.env.ROOT || process.cwd(), process.env.PORT, {
		'/example-extension.xml': process.env.XML,
		'/example-extension.crx': process.env.CRX
	});
}
