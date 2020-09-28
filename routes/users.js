const express = require("express");
const ExpressError = require("../helpers/expressError");
const User = require("../models/userModel");
const jsonschema = require("jsonschema");
const userSchema = require("../schema/userSchema.json");
const updateUserSchema = require("../schema/updateUserSchema.json");
const { ensureCorrectUser } = require("../middleware/auth");
const createToken = require("../helpers/createToken");

const router = new express.Router();

/** GET / => {users : [userData], [user2Data], ...} */
router.get("/", async (req, res, next) => {
	try {
		let users = await User.all();

		return res.json({ users });
	} catch (e) {
		return next(e);
	}
});

/** POST / {userData, _token: tokenDate} => {user: newUser} */
router.post("/", async (req, res, next) => {
	try {
		// try user against schema
		const result = jsonschema.validate(req.body, userSchema);

		// if user fails against schema throw error
		if (!result.valid) {
			let listErr = result.errors.map((e) => e.stack);
			let err = new ExpressError(listErr, 400);
			return next(err);
		}
		// we know user passes and create in DB and return as json
		const user = await User.create(req.body);
		const token = await user.authenticate(req.body.password);
		return res.status(201).json({ user, token });
	} catch (e) {
		return next(e);
	}
});

/** GET /[id] => {user: userData} */
router.get("/:id", async (req, res, next) => {
	try {
		const user = await User.get(req.params.id);
		return res.json({ user });
	} catch (e) {
		return next(e);
	}
});

/** PATCH /[id] {userData, _token: tokenDate} => {user: userData} */
router.patch("/:id", ensureCorrectUser, async (req, res, next) => {
	try {
		if ("id" in req.body) {
			return next({ status: 400, message: "Not allowed" });
		}

		// validate against schema
		// note this will let you update any field except the id. Further front end validation for updating email and password is recommended
		const result = jsonschema.validate(req.body, updateUserSchema);
		if (!result.valid) {
			let listErr = result.errors.map((e) => e.stack);
			let err = new ExpressError(listErr, 400);
			return next(err);
		}
		let u = await User.get(req.params.id);

		let user = await u.update(req.body);

		// if user is updated you will need to save the new token as email may have changed which effects the authorization checks
		const token = await createToken(user.email);

		return res.json({ user, token });
	} catch (e) {
		return next(e);
	}
});

/** DELETE /[id] => {message: "User deleted"} */
router.delete("/:id", ensureCorrectUser, async (req, res, next) => {
	try {
		await User.remove(req.params.id);
		return res.json({ message: "User deleted" });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
