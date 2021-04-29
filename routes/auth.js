const express = require("express");
const User = require("../models/userModel");
const Tradesman = require("../models/tradesmanModel");

const router = new express.Router();

router.post("/login/user", async (req, res, next) => {
	try {
		let { password, email } = req.body;
		console.log({ password, email });
		let user = await User.getAll(email);
		console.log({ user });
		let token = await user.authenticate(password);
		console.log({ token });
		return res.json({ token, user_type: "user", email, id: user.id });
	} catch (e) {
		console.log({ error: e });
		return next(e);
	}
});

router.post("/login/tradesmen", async (req, res, next) => {
	try {
		let { password, email } = req.body;
		let user = await Tradesman.getAll(email);
		let token = await user.authenticate(password);
		return res.json({ token, user_type: "tradesmen", email, id: user.id });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
