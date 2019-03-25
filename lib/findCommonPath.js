const pathSeparator = require('path').sep;

/**
 * @module crx3/lib/findCommonPath
 */
module.exports = findCommonPath;

/**
 * Finds the longest possible path that's a common parent to all specified paths.
 *
 * @alias module:crx3/lib/findCommonPath
 * @param {string[]} paths
 * @return {string}
 */
function findCommonPath (paths) {
	if (!Array.isArray(paths) || paths.length < 1) {
		return '';
	}

	var lastSeparatorAt = paths[0].lastIndexOf(pathSeparator);
	if (lastSeparatorAt < 0) {
		return '';
	}

	if (lastSeparatorAt < 1) {
		return pathSeparator;
	}

	var common = paths[0].substring(0, lastSeparatorAt + 1);
	if (paths.length < 2) { // eslint-disable-line no-magic-numbers
		return common;
	}

	common = common.split(pathSeparator);
	var lastCommonIndex = common.length - 1;
	// Ignore last empty item, since we know that last character was a separator
	lastCommonIndex -= 1;

	var current;
	var i;
	var m;
	for (var index = 1, max = paths.length; index < max; index++) {
		current = paths[index].split(pathSeparator);
		for (i = 0, m = current.length; i < m; i++) {
			if (i > lastCommonIndex) {
				break;
			}
			if (current[i] !== common[i]) {
				lastCommonIndex = i - 1;
				break;
			}
		}
	}

	common.length = lastCommonIndex + 1;
	return common.join(pathSeparator) + pathSeparator;
}
