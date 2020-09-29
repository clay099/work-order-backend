const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../config");

/** return signed JWT from user data. */

function createToken(email, id, user_type) {
	let payload = {
		email,
		id,
		user_type,
	};

	return jwt.sign(payload, JWT_SECRET_KEY);
}

module.exports = createToken;
