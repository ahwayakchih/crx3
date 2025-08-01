CRX3
====

This module allows you to create web extension files for Chromium, Google Chrome and all other browsers supporting the file format and API, e.g., Opera.

It creates CRXv3 files, which work for Chrome versions 64.0.3242 and above.

If you need to create web extension file for older browser versions, where CRXv3 is not supported, use [CRX module](https://github.com/oncletom/crx) instead.

It requires Node.js version 22 (or above) or Bun version 1.2.18 (or above) and runs on Linux, MacOS and Windows.

[![Build status on Linux, MacOS and Windows](https://github.com/ahwayakchih/crx3/actions/workflows/test.yml/badge.svg?branch=master)](https://github.com/ahwayakchih/crx3/actions/workflows/test.yml "Linux, MacOS and Windows build logs")
[![Build status of puppeteer container](https://github.com/ahwayakchih/crx3/actions/workflows/puppeteer-container.yml/badge.svg?branch=master)](https://github.com/ahwayakchih/crx3/actions/workflows/puppeteer-container.yml "Puppeteer container build and test logs")

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
- *--forceDateTime*     : specify UNIX timestamp to be used for content of a new ZIP file
- *--appVersion*        : specify version number to be written into Update Manifest file
- *--crxURL*            : specify URL to be written into Update Manifest file
- *--browserVersion*    : specify minimum browser version required to run web extension

If any of the `*Path` options is not followed by a path or a file name, output file name will be based on the web extension's directory name.

Private key file will not be created if one already exist. Existing one will be used.
CRX, ZIP and XML files are always overwritten.

`--forceDateTime` is optional and used only when creating new ZIP file.

`--appVersion`, `--crxURL` and `--browserVersion` are used only for writing XML file.

For example:

```sh
crx3 -p -o -x -z some-other-name.zip web-extension
```

It will create "web-extension.pem" (if one does not exist yet), "web-extension.crx", "web-extension.xml" and "some-other-name.zip" files.

**WARNING**: if you're using option without name/path, it must be specified before option with name/path. Otherwise, be sure that the list of directories and/or files to include in web extension file is specified after the special `--` marker, like this:

```sh
crx3 -z some-other-name.zip -x -o -- web-extension
```

If you already have a ZIP file containing web extension's files, you can use CRX3 like this:

```sh
cat web-extension.zip | crx3 -p web-extension.pem
```

It will convert existing ZIP file into a "web-extension.crx" file and create a "web-extension.pem" file.
Make sure that ZIP file content has no parent directory, e.g., "manifest.json" file has to be there, not "web-extension/manifest.json".
Otherwise new CRX file will not work in a browser.

**WARNING**: CRX3 does not read contents of the ZIP file. Which means, that for an optional XML file to be working, either `APP_VERSION` environment variable or `--appVersion` argument has to be specified. Otherwise XML file will contain "`${APP_VERSION}`" placeholder instead.
Same for `CRX_URL`/`--crxURL` and `BROWSER_VERSION`/`--browserVersion` values.

You can also create ZIP file on the fly, and pass it like this:

```sh
zip -r -9 -j - web-extension | crx3 -p web-extension.pem
```

## Usage (API)

```js
const crx3 = require('crx3');

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
```

## Known Issues

### CRX_REQUIRED_PROOF_MISSING (Chrome and Chromium)

Since version 75.x, Chrome requires Google's web store signature on extension files. CRX3 module does not provide those (that would require access to Google's private key). Following information is "guessed" by checking Chromium's source code at:

- https://github.com/chromium/chromium/blob/c48c9b176af94f7ec65e20f21594524526d2a830/components/crx_file/crx_verifier.cc#L178 error is returned only if either public or "required key" key is missing,
- https://github.com/chromium/chromium/blob/c48c9b176af94f7ec65e20f21594524526d2a830/components/crx_file/crx_verifier.cc#L134 and https://github.com/chromium/chromium/blob/c48c9b176af94f7ec65e20f21594524526d2a830/components/crx_file/crx_verifier.cc#L42 "required key" seems to be their predefined key.

So, there's a chance i got it wrong, in which case do not be afraid to create a new [issue](https://github.com/ahwayakchih/crx3/issues) about it.

Unless extension is being installed through the `chrome://extensions/` page, with "developer mode" enabled beforehand (it has to be enabled and then Chrome has to be restarted), there's a big chance that users will see `CRX_REQUIRED_PROOF_MISSING` error when they try to install `.crx` file created with CRX3 module.

For more information about changes required for hosting custom CRX extensions, see:
https://developer.chrome.com/docs/extensions/mv2/hosting-changes?hl=en#deployment

### Installing extension from CRX

On MacOS and Windows, Chrome does not allow to install extensions from local files any more (except through policies).

For more information about manually installing custom extensions, see:
https://developer.chrome.com/docs/extensions/how-to/distribute/install-extensions

On MacOS or Linux, extension can be installed through a [preferences file](https://developer.chrome.com/docs/extensions/how-to/distribute/install-extensions#preferences), as long as:

- it's [`update_url`](https://developer.chrome.com/docs/extensions/how-to/distribute/host-on-linux#update_url) value in `manifest.json` file is correct,
- it's from server with [correct setup](https://developer.chrome.com/docs/extensions/how-to/distribute/host-on-linux#hosting).

On Windows, they can be installed via [Windows registry](https://developer.chrome.com/docs/extensions/how-to/distribute/install-extensions#registry).

On all systems, extensions can be installed through a policy setup:

- see how to do that at https://www.chromium.org/administrators/configuring-policy-for-extensions,
- see what policies can be configured at https://www.chromium.org/administrators/policy-list-3.

## API Documentation

To generate documentation for this module, clone module from repository (package does not include required files) and use:

```sh
npm run doc
```

To write extensions, use [Extension API](https://developer.chrome.com/extensions) for Chrome/Chromium and [WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions) for Mozilla browsers. They are quite similar, so it is possible to create an extension that works on all of them (it just needs to be build into different extension file formats - you can use https://github.com/mozilla/web-ext for Mozilla).

## Testing

To run tests, clone module (see [API Documentation](#API-documentation)) and use:

```sh
npm test
```

Tests include optional support for checking if CRX files built by the module will run in Chromium browser on a Linux system. To make it work:

- make sure that Chrome or Chromium browser is already installed,
- make sure that `CHROME_BIN` environment variable is set with path to the browser's executable,
- make sure that `CHROME_POLICIES` environment variable points to existing directory tree used by the browser to read policies,
- optionally set `DEBUG` environment variable to `true`, to get additional output from test server,
- optionally set `FILE_CHECK_DELAY` environment variable to number of milliseconds to wait for between various checks (defaults to 1500),
- run `npm run puppeteer` to install additional dependencies.

`/etc/chromium/policies` is used by default if no `CHROME_POLICIES` is specified. Which will NOT work if Google's Chrome is used, as explained in Chromium's [Linux Quick Start](https://www.chromium.org/administrators/linux-quick-start/).

**WARNING:** Since there is no way to imitate installation process of a CRX file through the puppeteer (or is there?), test will try to create an `${CHROME_POLICIES}/managed/crx3-example-extension-test.json` policy file to "force install" it. That is why it is best to run whole thing in a virtual machine, e.g., using [`qemu`](https://www.qemu.org/), or in a container, e.g., using [`podman`](https://podman.io/) or [`docker`](https://www.docker.com/).

There is an official puppeteer docker image, but it's ~2 GB, which is unnecessarily huge. Using `podman` or `docker`, you can build image that's less than half of that size and is more than enough for testing if generated CRX3 works in a Chromium browser.

### Testing with [rootless `podman`](https://github.com/containers/podman/blob/main/README.md#rootless)

First step is to prepare container image. This step is needed only once.

```sh
# 1. Prepare container, this step is needed only once
podman build -t puppeteer -f puppeteer.containerfile
# 2. Install puppeteer-core, this step is needed only once
podman run --rm --init -v $(pwd):/app -w /app --userns=keep-id:uid=1000,gid=1000 -it puppeteer:latest npm run puppeteer
```

After container image is ready, every time you want to run test, just use:

```sh
podman run --rm --init -v $(pwd):/app -w /app --userns=keep-id:uid=1000,gid=1000 -it puppeteer:latest xvfb-run npm test
```
