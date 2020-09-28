const express = require("express");
const ExpressError = require("../helpers/expressError");
const User = require("../models/userModel");

const router = new express.Router();

router.post("/login", async (req, res, next) => {
	try {
		let { password, email } = req.body;
		let user = await User.getAll(email);
		let token = await user.authenticate(password);
		return res.json({ token });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
