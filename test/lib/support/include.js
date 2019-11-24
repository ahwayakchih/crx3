/**
 * This function "requires" module if it is available.
 * If it's not, it returns `null`.
 *
 * @param {string} name
 */
module.exports = function include (name) {
	var result = null;
	try {
		result = require(name); // eslint-disable-line global-require
	}
	catch (err) {
		// Ignore error.
		result = null;
	}

	return result;
};
