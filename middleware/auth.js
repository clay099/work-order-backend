/** Middleware for handling req authorization for routes. */

const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/expressError");
const User = require("../models/userModel");

/** Middleware: Authenticate user. */

function authenticateJWT(req, res, next) {
	try {
		const tokenFromBody = req.body._token;
		const payload = jwt.verify(tokenFromBody, JWT_SECRET_KEY);
		req.user = payload; // {email}
		return next();
	} catch (err) {
		return next();
	}
}

/** Middleware: Requires user is authenticated. */

function ensureLoggedIn(req, res, next) {
	if (!req.user) {
		const err = new ExpressError(`Unauthorized`, 401);
		return next(err);
	} else {
		return next();
	}
}
/** Middleware: Requires correct username. */

async function ensureCorrectUser(req, res, next) {
	try {
		let user = await User.get(req.params.id);
		if (req.user.email === user.email) {
			return next();
		} else {
			const err = new ExpressError(`Unauthorized`, 401);
			return next(err);
		}
	} catch (e) {
		// errors would happen here if we made a request and req.user is undefined
		const err = new ExpressError(`Unauthorized`, 401);
		return next(err);
	}
}

/** Middleware: Requires is_admin. */

function ensureIsAdmin(req, res, next) {
	try {
		if (req.user.is_admin === true) {
			return next();
		} else {
			const err = new ExpressError(`Unauthorized`, 401);
			return next(err);
		}
	} catch (e) {
		// errors would happen here if we made a request and req.user is undefined
		const err = new ExpressError(`Unauthorized`, 401);
		return next(err);
	}
}

module.exports = {
	authenticateJWT,
	ensureLoggedIn,
	ensureCorrectUser,
	ensureIsAdmin,
};
