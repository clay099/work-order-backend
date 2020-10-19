/** Middleware for handling req authorization for routes. */

const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/expressError");
const User = require("../models/userModel");
const Tradesman = require("../models/tradesmanModel");
const Projects = require("../models/projectModel");
const Chat = require("../models/chatModel");
const Photo = require("../models/photoModel");

/** Middleware: Authenticate user. */

function authenticateJWT(req, res, next) {
	try {
		const tokenFromBody = req.body._token || req.query._token;
		const payload = jwt.verify(tokenFromBody, JWT_SECRET_KEY);
		req.user = payload; // {email, id, user_type}
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

/** Middleware: Requires project id
 * check that the user or tradesman can only update / delete projects they are working on
 */
async function ensureValidChatUser(req, res, next) {
	try {
		let projectChat = await Chat.getUserChat(req.user);
		// checks if the user id is included in the projectChat.
		// only allow user to proceed if a valid id is found
		for (let chat of projectChat) {
			if (req.user.user_type === "user") {
				if (req.user.id === chat.user_id) {
					return next();
				}
			} else {
				// user is tradesmen check if ids match those of a tradesman
				if (req.user.id === chat.tradesmen_id) {
					return next();
				}
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

/** Middleware: Requires project id
 * check that only the user can only update / delete projects they are working on
 */
async function ensureValidReviewUser(req, res, next) {
	try {
		let userProjects;
		// check is user_type if "user" or "tradesman" - used to determine which model to call
		if (req.user.user_type === "user") {
			userProjects = await Projects.allUser(req.user.id);
		} else {
			const err = new ExpressError(`Unauthorized`, 401);
			return next(err);
		}

		// checks if the project id is included in the userProjects list.
		// only allow user to proceed if a valid id is found
		for (let project of userProjects) {
			if (project.id === +req.params.projectId) {
				return next();
			}
		}
		const err = new ExpressError(`Unauthorized`, 401);
		return next(err);
	} catch (e) {
		// errors would happen here if we made a request and req.user is undefined or if user has not chat associated with them
		const err = new ExpressError(`Unauthorized`, 401);
		return next(err);
	}
}

/** Middleware: Requires project id
 * check that the user can only update / delete photos for projects they are involved with
 */
async function ensureValidPhotoUser(req, res, next) {
	try {
		// if updated or create project id will be in body
		if (req.body.project_id) {
			let userProjects;
			// check is user_type if "user" or "tradesman" - used to determine which model to call
			if (req.user.user_type === "user") {
				userProjects = await Projects.allUser(req.user.id);
			} else {
				const err = new ExpressError(`Unauthorized`, 401);
				return next(err);
			}

			// checks if the project id is included in the userProjects list.
			// only allow user to proceed if a valid id is found
			if (req.body.project_id) {
				for (let project of userProjects) {
					if (project.id === +req.body.project_id) {
						return next();
					}
				}
			}
		}

		// if project_id is not in the body we need to check the photo itself
		let photo = await Photo.get(req.params.id);
		if (photo.user_id === req.user.id) {
			return next();
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
	ensureValidChatUser,
	ensureValidReviewUser,
	ensureValidPhotoUser,
};
