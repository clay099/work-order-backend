/** Middleware for handling req authorization for routes. */

const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/expressError");
const User = require("../models/userModel");
const Tradesman = require("../models/tradesmanModel");
const Projects = require("../models/projectModel");

/** Middleware: Authenticate user. */

function authenticateJWT(req, res, next) {
	try {
		const tokenFromBody = req.body._token;
		const payload = jwt.verify(tokenFromBody, JWT_SECRET_KEY);
		req.user = payload; // {email, id}
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

/** Middleware: Requires correct id for users
 * check that the user or tradesman can only update / delete their own profiles
 */
async function ensureCorrectUser(req, res, next) {
	try {
		let user;
		// check is user_type if "user" or "tradesman" - used to determine which model to call
		if (req.user.user_type === "user") {
			user = await User.get(req.params.id);
		} else {
			user = await Tradesman.get(req.params.id);
		}

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

/** Middleware: Requires project id
 * check that the user or tradesman can only update / delete projects they are working on
 */
async function ensureValidUser(req, res, next) {
	try {
		let userProjects;
		// check is user_type if "user" or "tradesman" - used to determine which model to call
		if (req.user.user_type === "user") {
			userProjects = await Projects.allUser(req.user.id);
		} else {
			userProjects = await Projects.allTradesman(req.user.id);
		}

		// checks if the project id is included in the userProjects list.
		// only allow user to proceed if a valid id is found
		for (let project of userProjects) {
			if (project.id === +req.params.id) {
				return next();
			}
		}
		const err = new ExpressError(`Unauthorized`, 401);
		return next(err);
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
	ensureValidUser,
};
