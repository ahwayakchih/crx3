module.exports = testVersionRequirement;

/**
 * Compare version strings and return true if actual >= expected.
 *
 * @example
 *   console.log(testVersionRequirement('1.2.3-beta', '1.2.3-alpha')); // Output: true
 *
 * @param {string|number} actual
 * @param {string|number} expected
 * @return {boolean}
 */
function testVersionRequirement (actual, expected) {
	if (!expected) {
		return true;
	}

	if (!actual) {
		return false;
	}

	const a = actual.split('.');
	const e = expected.split('.');

	var ai;
	var ei;
	for (var index = 0, max = Math.max(a.length, e.length); index < max; index++) {
		ai = a[index] || '0';
		ei = e[index] || '0';

		if (ai === ei) {
			continue;
		}

		if (isNaN(ai) || isNaN(ei)) {
			return stringCompare(ai, ei) > 0;
		}

		return parseInt(ai, 10) > parseInt(ei, 10);
	}

	return true;
}

/**
 * @private
 * @param {string|number} actual
 * @param {string|number} expected
 * @return {number}
 */
function stringCompare (actual = '', expected = '') {
	const a = actual.split('-');
	const e = expected.split('-');

	var ai;
	var ei;
	for (var index = 0, max = Math.max(a.length, e.length); index < max; index++) {
		ai = a[index];
		ei = e[index];
		if (typeof ai === 'undefined') {
			ai = index > 0 ? 'z' : '0';
		}
		if (typeof ei === 'undefined') {
			ei = index > 0 ? 'z' : '0';
		}

		if (ai === ei) {
			continue;
		}

		if (isNaN(ai) || isNaN(ei)) {
			return ai.localeCompare(ei, undefined, {numeric: true}); // eslint-disable-line no-undefined
		}

		return parseInt(ai, 10) - parseInt(ei, 10);
	}

	return 0;
}
