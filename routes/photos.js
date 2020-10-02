const express = require("express");
const ExpressError = require("../helpers/expressError");
const Photo = require("../models/PhotoModel");
const jsonschema = require("jsonschema");
const photoSchema = require("../schema/photoSchema.json");
const updatePhotoSchema = require("../schema/updatePhotoSchema.json");
const { ensureValidPhotoUser, ensureLoggedIn } = require("../middleware/auth");

const router = new express.Router();

/** GET / => {photos : [{photoData}, {photo2Data}, ...]} */
router.get("/", async (req, res, next) => {
	try {
		let photos = await Photo.all();

		return res.json({ photos });
	} catch (e) {
		return next(e);
	}
});

/** POST / {photoData} => {photo: newPhoto} */
router.post("/", ensureValidPhotoUser, async (req, res, next) => {
	try {
		// try user against schema
		const result = jsonschema.validate(req.body, photoSchema);

		// if photo fails against schema throw error
		if (!result.valid) {
			let listErr = result.errors.map((e) => e.stack);
			let err = new ExpressError(listErr, 400);
			return next(err);
		}
		// we know photo passes and create in DB and return as json
		const photo = await Photo.create({ ...req.body, user_id: req.user.id });
		return res.status(201).json({ photo });
	} catch (e) {
		return next(e);
	}
});

/** GET /[id] => {photo: photoData} */
router.get("/:id", ensureLoggedIn, async (req, res, next) => {
	try {
		const photo = await Photo.get(req.params.id);
		return res.json({ photo });
	} catch (e) {
		return next(e);
	}
});

/** PATCH /[id] {photoData, _token: tokenDate} => {photo: photoData} */
router.patch("/:id", ensureValidPhotoUser, async (req, res, next) => {
	try {
		if ("id" in req.body) {
			let err = new ExpressError("Not allowed to change 'ID'", 400);
			return next(err);
		}

		// validate against schema
		// note this will let you update any field except the id.
		const result = jsonschema.validate(req.body, updatePhotoSchema);
		if (!result.valid) {
			let listErr = result.errors.map((e) => e.stack);
			let err = new ExpressError(listErr, 400);
			return next(err);
		}
		let p = await Photo.get(req.params.id);

		let photo = await p.update(req.body);

		return res.json({ photo });
	} catch (e) {
		return next(e);
	}
});

/** DELETE /[id] => {message: "Photo deleted"} */
router.delete("/:id", ensureValidPhotoUser, async (req, res, next) => {
	try {
		await Photo.remove(req.params.id);
		return res.json({ message: "Photo deleted" });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
