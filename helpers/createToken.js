const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../config");

/** return signed JWT from user data. */

function createToken(email) {
	let payload = {
		email: email,
	};

	return jwt.sign(payload, JWT_SECRET_KEY);
}

module.exports = createToken;
