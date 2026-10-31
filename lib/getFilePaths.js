const fs = require('fs');
const path = require('path');

/**
 * @module crx3/lib/getFilePaths
 */
module.exports = getFilePaths;

/**
 * If list contains only a path to `manifest.json` file,
 * return list of files from its directory.
 *
 * Otherwise scan directories recursively and return a list of all files.
 *
 * @alias module:crx3/lib/getFilePaths
 * @param {string[]} list                         can contain paths to directories and/or files
 * @param {boolean} [followSymbolicLinks=false]   symlinked paths won't be included unless this option is set to true
 * @return {string[]}
 */
function getFilePaths (list, followSymbolicLinks = false) {
	if (!Array.isArray(list) || list.length < 1) {
		return [];
	}

	var stat;
	if (list.length === 1 && path.basename(list[0]) === 'manifest.json') {
		stat = fs.statSync(path.dirname(list[0]));
		stat.name = path.dirname(list[0]);
		return scanList([stat], '', followSymbolicLinks);
	}

	return scanList(list.map(file => {
		try {
			stat = fs.statSync(file);
			stat.name = file;
			return stat;
		}
		catch (err) { // eslint-disable-line no-unused-vars
			// Ignore
			return null;
		}
	}), '', followSymbolicLinks);
}

/**
 * File system module
 *
 * @external fs
 * @see {@link https://nodejs.org/api/fs.html}
 */

/**
 * Dirent object.
 *
 * @typedef {object} Dirent
 * @memberof external:fs
 * @see {@link https://nodejs.org/api/fs.html#fs_class_fs_dirent}
 */

/**
 * Stats object.
 *
 * @typedef {object} Stats
 * @memberof external:fs
 * @see {@link https://nodejs.org/api/fs.html#fs_class_fs_stats}
 */

/**
 * @private
 * @param {external:fs.Stats[]|external:fs.Dirent[]} list
 * @param {string}                                   [parent='']                   path to parent directory
 * @param {boolean}                                  [followSymbolicLinks=false]   include paths pointed to by symlinks
 * @return {string[]}
 */
function scanList (list, parent = '', followSymbolicLinks = false) {
	const result = [];

	var filepath;
	for (var i = 0, max = list.length; i < max; i++) {
		if (!list[i]) {
			continue;
		}

		filepath = path.join(parent, list[i].name);

		if (list[i].isDirectory()) {
			Array.prototype.push.apply(result, scanList(fs.readdirSync(filepath, {withFileTypes: true}), filepath, followSymbolicLinks));
		}
		else if (list[i].isFile()) {
			result.push(filepath);
		}
		else if (followSymbolicLinks && list[i] instanceof fs.Dirent && list[i].isSymbolicLink()) {
			const stat = fs.statSync(filepath);
			if (stat.isFile() || stat.isDirectory()) {
				stat.name = list[i].name;
				list[i] = stat;
				i--;
			}
		}
	}

	return result;
}
