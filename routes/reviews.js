const express = require("express");
const ExpressError = require("../helpers/expressError");
const Review = require("../models/reviewModel");
const Project = require("../models/projectModel");
const jsonschema = require("jsonschema");
const reviewSchema = require("../schema/reviewSchema.json");
const updateReviewSchema = require("../schema/updateReviewSchema.json");
const { ensureLoggedIn, ensureValidChatUser } = require("../middleware/auth");

const router = new express.Router();

/** POST / {reviewData, _token: tokenDate} => {review: newReview} */
router.post("/", ensureLoggedIn, async (req, res, next) => {
	try {
		// try review against schema
		const result = jsonschema.validate(req.body, reviewSchema);

		// if review fails against schema throw error
		if (!result.valid) {
			let listErr = result.errors.map((e) => e.stack);
			let err = new ExpressError(listErr, 400);
			return next(err);
		}

		let project = await Project.get(req.body.project_id, req.user);
		// we know review passes and create in DB and return as json
		const review = await Review.create({
			...req.body,
			user_id: req.user.id,
			tradesmen_id: project.tradesmen_id,
		});
		return res.status(201).json({ review });
	} catch (e) {
		return next(e);
	}
});

/** GET /[id] => {review: reviewData} */
router.get("/:id", ensureLoggedIn, async (req, res, next) => {
	try {
		const review = await Review.get(req.params.id);
		return res.json({ review });
	} catch (e) {
		return next(e);
	}
});

/** PATCH /[projectId] {reviewData, _token: tokenDate} => {review: reviewData} */
router.patch("/:projectId", ensureValidChatUser, async (req, res, next) => {
	try {
		if (
			"user_id" in req.body ||
			"tradesmen_id" in req.body ||
			"project_id" in req.body
		) {
			let err = new ExpressError(
				"Not allowed to change 'user_id', 'tradesmen_id' or 'project_id'",
				400
			);
			return next(err);
		}

		// validate against schema
		const result = jsonschema.validate(req.body, updateReviewSchema);
		if (!result.valid) {
			let listErr = result.errors.map((e) => e.stack);
			let err = new ExpressError(listErr, 400);
			return next(err);
		}
		let r = await Review.get(req.params.projectId, req.user);

		let review = await r.update(req.body);

		return res.json({ review });
	} catch (e) {
		return next(e);
	}
});

/** DELETE /[id] => {message: "review deleted"} */
router.delete("/:id", ensureValidChatUser, async (req, res, next) => {
	try {
		await Review.remove(req.params.id);
		return res.json({ message: "review deleted" });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
