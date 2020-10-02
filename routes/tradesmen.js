const express = require("express");
const ExpressError = require("../helpers/expressError");
const Tradesman = require("../models/tradesmanModel");
const jsonschema = require("jsonschema");
const tradesmanSchema = require("../schema/tradesmanSchema.json");
const updateTradesmanSchema = require("../schema/updateTradesmanSchema.json");
const { ensureCorrectUser } = require("../middleware/auth");
const createToken = require("../helpers/createToken");
const validator = require("validator");

const router = new express.Router();

/** GET / => {tradesmen : [tradesmanData], [tradesman2Data], ...} */
router.get("/", async (req, res, next) => {
	try {
		let tradesmen = await Tradesman.all();

		return res.json({ tradesmen });
	} catch (e) {
		return next(e);
	}
});

/** POST / {tradesmanData, _token: tokenDate} => {tradesman: newTradesman} */
router.post("/", async (req, res, next) => {
	try {
		// try tradesman against schema
		const result = jsonschema.validate(req.body, tradesmanSchema);

		// if tradesman fails against schema throw error
		if (!result.valid) {
			let listErr = result.errors.map((e) => e.stack);
			let err = new ExpressError(listErr, 400);
			return next(err);
		}
		if (!validator.isEmail(req.body.email)) {
			let err = new ExpressError(
				`${req.body.email} is not a valid email`,
				400
			);
			return next(err);
		}
		// we know tradesman passes and create in DB and return as json
		const tradesman = await Tradesman.create(req.body);
		const token = await tradesman.authenticate(req.body.password);
		return res.status(201).json({ tradesman, token });
	} catch (e) {
		return next(e);
	}
});

/** GET /[id] => {tradesman: tradesmanData} */
router.get("/:id", async (req, res, next) => {
	try {
		const tradesman = await Tradesman.get(req.params.id);
		return res.json({ tradesman });
	} catch (e) {
		return next(e);
	}
});

/** PATCH /[id] {tradesmanData, _token: tokenDate} => {tradesman: tradesmanData} */
router.patch("/:id", ensureCorrectUser, async (req, res, next) => {
	try {
		if ("id" in req.body) {
			let err = new ExpressError("Not allowed to change 'ID'", 400);
			return next(err);
		}

		// validate against schema
		// note this will let you update any field except the id. Further front end validation for updating email and password is recommended
		const result = jsonschema.validate(req.body, updateTradesmanSchema);
		if (!result.valid) {
			let listErr = result.errors.map((e) => e.stack);
			let err = new ExpressError(listErr, 400);
			return next(err);
		}

		// checks if email is to be updated & if it is checks that it is a valid email
		if (req.body.email && !validator.isEmail(req.body.email)) {
			let err = new ExpressError(
				`${req.body.email} is not a valid email`,
				400
			);
			return next(err);
		}

		let t = await Tradesman.get(req.params.id);

		let tradesman = await t.update(req.body);

		// if tradesman is updated you will need to save the new token as email may have changed which effects the authorization checks
		const token = await createToken(
			tradesman.email,
			tradesman.id,
			"tradesman"
		);

		return res.json({ tradesman, token });
	} catch (e) {
		return next(e);
	}
});

/** DELETE /[id] => {message: "Tradesman deleted"} */
router.delete("/:id", ensureCorrectUser, async (req, res, next) => {
	try {
		await Tradesman.remove(req.params.id);
		return res.json({ message: "Tradesman deleted" });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
