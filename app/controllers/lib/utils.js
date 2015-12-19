'use strict';

var Type = require('type-of-is');

let check = (o, type) => {
	if (!Type.is(o, type)) {
		throw new TypeError(`Failed checking types. Expected: ${typeof(o)}, Actual: ${typeof(type)}`);
	}
}

module.exports = {
	check
}
