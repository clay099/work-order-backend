const express = require("express");
const ExpressError = require("../helpers/expressError");
const Project = require("../models/projectModel");
const jsonschema = require("jsonschema");
const projectSchema = require("../schema/projectSchema.json");
const updateProjectSchema = require("../schema/updateProjectSchema.json");
const { ensureLoggedIn, ensureValidUser } = require("../middleware/auth");

const router = new express.Router();

/** GET / => {projects : [projectData], [project2Data], ...}
 * can only get projects which you are involved with either as user or tradesman
 */
router.get("/", ensureLoggedIn, async (req, res, next) => {
	try {
		let projects;
		// checks if user or tradesman is requesting projects
		if (req.user.user_type === "user") {
			projects = await Project.allUser(req.user.id);
		} else {
			projects = await Project.allTradesman(req.user.id);
		}

		return res.json({ projects });
	} catch (e) {
		return next(e);
	}
});

/** GET /new / {_token: tokenDate} => {projects : [projectData], [project2Data], ...}
 * only a tradesman can see new projects which are in the "auction" status
 */
router.get("/new", ensureLoggedIn, async (req, res, next) => {
	try {
		let projects;
		// checks if user or tradesman is requesting projects
		if (req.user.user_type === "tradesman") {
			projects = await Project.newProject(req.user.id);
		} else {
			throw new ExpressError("Unauthorized", 401);
		}

		return res.json({ projects });
	} catch (e) {
		return next(e);
	}
});

/** POST / {projectData, _token: tokenDate} => {project: newProject}
 * only a user can start a project
 */
router.post("/", ensureLoggedIn, async (req, res, next) => {
	try {
		// checks that a user is requesting to create a project
		if (req.user.user_type !== "user") {
			throw new ExpressError("Unauthorized", 401);
		} else {
		}
		// try project against schema
		const result = jsonschema.validate(req.body, projectSchema);

		// if project fails against schema throw error
		if (!result.valid) {
			let listErr = result.errors.map((e) => e.stack);
			let err = new ExpressError(listErr, 400);
			return next(err);
		}

		// check that project hasn't been created before and returns error if it has
		const userProjects = await Project.allUser(req.user.id);
		for (let project of userProjects) {
			if (project.description === req.body.description) {
				let err = new ExpressError(
					`project '${project.description}' already created under project id '${project.id}'`,
					400
				);
				return next(err);
			}
		}

		// we know project passes and create in DB and return as json
		const project = await Project.create({
			...req.body,
			user_id: req.user.id,
		});
		return res.status(201).json({ project });
	} catch (e) {
		return next(e);
	}
});

/** GET /[id] => {project: projectData} */
router.get("/:id", ensureLoggedIn, async (req, res, next) => {
	try {
		const project = await Project.get(req.params.id, req.user);
		return res.json({ project });
	} catch (e) {
		return next(e);
	}
});

/** PATCH /[id] {projectData, _token: tokenDate} => {project: projectData} */
router.patch("/:id", ensureValidUser, async (req, res, next) => {
	try {
		if ("id" in req.body) {
			let err = new ExpressError("Not allowed to change 'ID'", 400);
			return next(err);
		}

		// validate against schema
		const result = jsonschema.validate(req.body, updateProjectSchema);
		if (!result.valid) {
			let listErr = result.errors.map((e) => e.stack);
			let err = new ExpressError(listErr, 400);
			return next(err);
		}
		let p = await Project.get(req.params.id, req.user);

		let project = await p.update(req.body);

		return res.json({ project });
	} catch (e) {
		return next(e);
	}
});

/** DELETE /[id] => {message: "Project deleted"} */
router.delete("/:id", ensureValidUser, async (req, res, next) => {
	try {
		await Project.remove(req.params.id);
		return res.json({ message: "Project deleted" });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
