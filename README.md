CRX3
====

This module allows you to create web extension files for Chromium and Google Chrome browsers.

It creates CRXv3 files, which work for Chrome versions 64.0.3242 and above.

If you need to create web extension file for older browser versions, where CRXv3 is not supported, use [CRX module](https://github.com/oncletom/crx) instead.

It requires Node.js version 11.6.0 (or above) to run.

# Installation

To install CRX3, as with most of the other Node.js modules, use following command line:

```sh
npm install crx3
```

or install it globally:

```sh
npm install -g crx3
```

## Usage (CLI)

If you installed CRX3 globally, or you are trying to use it from your project's `package.json` script(s), you should be able to use it like this:

```sh
crx3 web-extension-directory
```

It supports following options:

- *-z, --zip, --zipPath*: create also a simple ZIP file with web extension's files
- *-o, --crx, --crxPath*: specify custom path name for CRX3 file
- *-p, --key, --keyPath*: specify custom path name for private key file
- *-x, --xml, --xmlPath*: specify custom path name for XML (Update Manifest) file
- *--appVersion*        : specify version number to be written into Update Manifest file
- *--crxURL*            : specify URL to be written into Update Manifest file
- *--browserVersion*    : specify minimum browser version required to run web extension

If option is not followed by a path/name, file name will be based on the web extension's directory name.

Private key file will not be created if one already exist. In such case, existing one will be used.
CRX, ZIP and XML files are always overwritten.

For example:

```sh
crx3 -p -o -x -z some-other-name.zip web-extension
```

It will create "web-extension.pem" (if one does not exist yet), "web-extension.crx", "web-extension.xml" and "some-other-name.zip" files.

**WARNING**: if you're using option without name/path, it must be specified before option with name/path. Otherwise, be sure that the list of directories and/or files to include in web extension file is specified after the special `--` marker, like this:

```sh
crx3 -z some-other-name.zip -z -o -- web-extension
```

If you already have a ZIP file containing web extension's files, you can use CRX3 like this:

```sh
cat web-extension.zip | crx3 -p web-extension.pem
```

It will read existing ZIP file contents and create "web-extension.crx" and "web-extension.pem" files.
Make sure that ZIP file content has no parent directory, e.g., "manifest.json" file has to be there, not "web-extension/manifest.json".
Otherwise new CRX file will not work in a browser.

**WARNING**: CRX3 does not read contents of the ZIP file. Which means, that for an optional XML file to be working, either `APP_VERSION` environment variable or `--appVersion` argument has to be specified. Otherwise XML file will contain "`${APP_VERSION}`" placeholder instead.
Same for `CRX_URL`/`--crxURL` and `BROWSER_VERSION`/`--browserVersion` values.

You can also create ZIP file on the fly, and pass it like this:

```sh
zip -r -9 -j - web-extension | crx3 -p web-extension.pem
```

## Usage (code)

```js
const crx3 = require('crx3');

crx3(['example/example-extension/manifest.json'], {
	keyPath: 'example/example-extension.pem',
	crxPath: 'example/example-extension.crx',
	zipPath: 'example/example-extension.zip'
})
	.then(() => console.log('done'))
	.catch(console.error)
;
```

## API Documentation

To generate documentation, use:

```sh
npm run doc
```

## Testing

To run tests, clone module from repository (package does not include required files) and use:

```sh
npm test
```
