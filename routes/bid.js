const express = require("express");
const ExpressError = require("../helpers/expressError");
const Bid = require("../models/bidModel");
const Project = require("../models/projectModel");
const jsonschema = require("jsonschema");
const bidSchema = require("../schema/bidSchema.json");
const { ensureLoggedIn } = require("../middleware/auth");

const router = new express.Router();

/** POST / {bidData, _token: tokenDate} => {bid: newBid} */
router.post("/", ensureLoggedIn, async (req, res, next) => {
	try {
		// short circuit if user is not a tradesmen
		if (req.user.user_type !== "tradesman") {
			let err = new ExpressError("Unauthorized", 401);
			return next(err);
		}

		// try bid against schema
		const result = jsonschema.validate(req.body, bidSchema);

		// if bid fails against schema throw error
		if (!result.valid) {
			let listErr = result.errors.map((e) => e.stack);
			let err = new ExpressError(listErr, 400);
			return next(err);
		}

		// we know bid passes and create in DB and return as json
		const bid = await Bid.create({
			...req.body,
			tradesmen_id: req.user.id,
		});
		return res.status(201).json({ bid });
	} catch (e) {
		return next(e);
	}
});

/** GET /[projectId] => {bid: bidData} */
router.get("/:projectId", ensureLoggedIn, async (req, res, next) => {
	try {
		// short circuit if user is not a user
		if (req.user.user_type !== "user") {
			let err = new ExpressError("Unauthorized", 401);
			return next(err);
		}

		// check project is associated with user id - only allow to get a project which you are involved with otherwise error will be thrown
		await Project.get(req.params.projectId, req.user);

		// show the bids for the project
		const bids = await Bid.getProjectBids(req.params.projectId, req.user);
		return res.json({ bids });
	} catch (e) {
		return next(e);
	}
});

/** PATCH /[id] {bidData, _token: tokenDate} => {bid: bidData} */
router.patch("/:id", ensureLoggedIn, async (req, res, next) => {
	try {
		// short circuit if user is not a tradesmen
		if (req.user.user_type !== "tradesman") {
			let err = new ExpressError("Unauthorized", 401);
			return next(err);
		}

		if (
			"id" in req.body ||
			"project_id" in req.body ||
			"req.body" in req.body
		) {
			let err = new ExpressError(
				"Not allowed to change 'ID' or 'project_id' or 'tradesmen_id",
				400
			);
			return next(err);
		}

		// validate against schema
		const result = jsonschema.validate(req.body, bidSchema);
		if (!result.valid) {
			let listErr = result.errors.map((e) => e.stack);
			let err = new ExpressError(listErr, 400);
			return next(err);
		}
		let b = await Bid.get(req.params.id);
		// check that tradesmen can only change their owner bid
		if (req.user.id !== b.tradesmen_id) {
			let err = new ExpressError("Unauthorized", 401);
			return next(err);
		}

		let bid = await b.update(req.body);

		return res.json({ bid });
	} catch (e) {
		return next(e);
	}
});

/** DELETE /[id] => {message: "Bid deleted"} */
router.delete("/:id", ensureLoggedIn, async (req, res, next) => {
	try {
		// short circuit if user is not a tradesmen
		let err = new ExpressError("Unauthorized", 401);
		if (req.user.user_type !== "tradesman") {
			return next(err);
		}

		let b = await Bid.get(req.params.id);
		// check that tradesmen can only change their owner bid
		if (req.user.id !== b.tradesmen_id) {
			return next(err);
		}

		await Bid.remove(req.params.id);
		return res.json({ message: "Bid deleted" });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
