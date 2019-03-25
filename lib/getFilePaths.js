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
 * @param {string[]} list   can contain paths to directories and/or files
 * @return {string[]}
 */
function getFilePaths (list) {
	if (!Array.isArray(list) || list.length < 1) {
		return [];
	}

	var stat;
	if (list.length === 1 && path.basename(list[0]) === 'manifest.json') {
		stat = fs.statSync(path.dirname(list[0]));
		stat.name = path.dirname(list[0]);
		return scanList([stat]);
	}

	return scanList(list.map(file => {
		try {
			stat = fs.statSync(file);
			stat.name = file;
			return stat;
		}
		catch (e) {
			// Ignore
			return null;
		}
	}));
}

/**
 * File system module
 *
 * @external fs
 * @see {@link https://nodejs.org/api/fs.html}
 */

/**
 * Dirent object.
 * @typedef external:fs.Dirent
 * @see {@link https://nodejs.org/api/fs.html#fs_class_fs_dirent}
 */

/**
 * Stats object.
 * @typedef external:fs.Stats
 * @see {@link https://nodejs.org/api/fs.html#fs_class_fs_stats}
 */

/**
 * @private
 * @param {Array<external:fs.Stats>|Array<external:fs.Dirent>} list
 * @param {string}                                             [parent='']   path to parent directory
 * @return {string[]}
 */
function scanList (list, parent = '') {
	const result = [];

	var filepath;
	for (var i = 0, max = list.length; i < max; i++) {
		if (!list[i]) {
			continue;
		}

		filepath = path.join(parent, list[i].name);

		if (list[i].isDirectory()) {
			Array.prototype.push.apply(result, scanList(fs.readdirSync(filepath, {withFileTypes: true}), filepath));
		}
		else if (list[i].isFile()) {
			result.push(filepath);
		}
	}

	return result;
}
