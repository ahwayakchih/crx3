Changelog
=========

**v1.1.4** - WIP

- Updated development dependencies
- Fixed test runs on Cirrus CI
- Improved error output when private key cannot be loaded

**v1.1.3** - 2020-11-06

- Fixed error handling when `manifest.json` is not found
- Check Node.js version when run from CLI
- Generated CRX files work in Opera browser too!
- Fixed compatibility with Node.js v15+

**v1.1.2** - 2020-01-11

- Support running without TTY while allowing to specify sources, instead of piping ZIP content
- Improve tests: test generated CRX with puppeteer on Cirrus CI, keep failed artifacts, cache modules, etc...
- It works with Podman (instead of Docker) too!

**v1.1.1** - 2019-10-09

- Output error info when private key cannot be loaded
- Finish CRX stream when no manifest.json is found
- Setup CI runners on AppVeyor (Windows) and Cirrus CI (Linux & MacOS)

**v1.1.0** - 2019-10-04

- Add support for manifest files
- Example extension will add decoration to localhost HTML
- Improve API documentation
- Improve tests: when possible test extension in Chromium browser

**v1.0.1** - 2019-03-25

- Specify min. required Node.js version

**v1.0.0** - 2019-03-25

- Initial release
