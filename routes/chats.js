const express = require("express");
const ExpressError = require("../helpers/expressError");
const Chat = require("../models/chatModel");
const jsonschema = require("jsonschema");
const chatSchema = require("../schema/chatSchema.json");
const updateChatSchema = require("../schema/updateChatSchema.json");
const { ensureLoggedIn, ensureValidChatUser } = require("../middleware/auth");

const router = new express.Router();

/** POST / {chatData, _token: tokenDate} => {chat: newchat} */
router.post("/", ensureLoggedIn, async (req, res, next) => {
	try {
		// try chat against schema
		const result = jsonschema.validate(req.body, chatSchema);

		// if chat fails against schema throw error
		if (!result.valid) {
			let listErr = result.errors.map((e) => e.stack);
			let err = new ExpressError(listErr, 400);
			return next(err);
		}

		// we know chat passes and create in DB and return as json
		const chat = await Chat.create({
			...req.body,
			user_id: req.user.id,
			user_type: req.user.user_type,
		});
		return res.status(201).json({ chat });
	} catch (e) {
		return next(e);
	}
});

/** GET /[id] => {chat: chatData} */
router.get("/:id", ensureLoggedIn, async (req, res, next) => {
	try {
		const chat = await Chat.getProjectChat(req.params.id, req.user);
		return res.json({ chat });
	} catch (e) {
		return next(e);
	}
});

/** PATCH /[id] {chatData, _token: tokenDate} => {chat: chatData} */
router.patch("/:id", ensureValidChatUser, async (req, res, next) => {
	try {
		if ("id" in req.body || "project_id" in req.body) {
			let err = new ExpressError(
				"Not allowed to change 'ID' or 'project_ID'",
				400
			);
			return next(err);
		}

		// validate against schema
		const result = jsonschema.validate(req.body, updateChatSchema);
		if (!result.valid) {
			let listErr = result.errors.map((e) => e.stack);
			let err = new ExpressError(listErr, 400);
			return next(err);
		}
		let c = await Chat.get(req.params.id, req.user);

		let chat = await c.update(req.body);

		return res.json({ chat });
	} catch (e) {
		return next(e);
	}
});

/** DELETE /[id] => {message: "Chat deleted"} */
router.delete("/:id", ensureValidChatUser, async (req, res, next) => {
	try {
		await Chat.remove(req.params.id);
		return res.json({ message: "Comment deleted" });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
