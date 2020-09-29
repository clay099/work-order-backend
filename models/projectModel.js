const db = require("../db");
const ExpressError = require("../helpers/expressError");
const createToken = require("../helpers/createToken");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BCRYPT_WORK_FACTOR } = require("../config");
const baseModel = require("./baseModel");
const { stat } = require("fs");

/**collection of related methods for project */

class Project extends baseModel {
	constructor({
		id,
		description,
		user_id,
		street_address,
		address_city,
		address_zip,
		address_country,
		created_at,
		price,
		tradesmen_id,
		status,
		completed_at,
		issues,
	}) {
		super();
		this.id = id;
		this.description = description;
		this.user_id = user_id;
		this.street_address = street_address;
		this.address_city = address_city;
		this.address_zip = address_zip;
		this.address_country = address_country;
		this.created_at = created_at;
		this.price = price;
		this.tradesmen_id = tradesmen_id;
		this.status = status;
		this.completed_at = completed_at;
		this.issues = issues;
	}

	/** creates a new project */
	static async create({
		user_id,
		description,
		street_address,
		address_city,
		address_zip,
		address_country,
	}) {
		let result;
		try {
			let { query, values } = Project.sqlForCreate(
				"projects",
				{
					user_id,
					description,
					street_address,
					address_city,
					address_zip,
					address_country,
				},
				[
					"id",
					"user_id",
					"description",
					"street_address",
					"address_city",
					"address_zip",
					"address_country",
				]
			);
			result = await db.query(query, values);
		} catch (error) {
			const err = new ExpressError(error.detail, 400);
			throw err;
		}
		const project = result.rows[0];

		if (project === undefined) {
			const err = new ExpressError("Could not create project", 400);
			throw err;
		}
		return new Project(project);
	}
	/** get all projects */
	static async all() {
		const result = await db.query(
			`SELECT * FROM projects ORDER BY created_at`
		);
		return result.rows.map((p) => new Project(p));
	}

	/** get all projects */
	static async allUser(id) {
		const result = await db.query(
			`SELECT * FROM projects WHERE user_id=$1 ORDER BY created_at DESC`,
			[id]
		);
		return result.rows.map((p) => {
			// remove columns who's value is null
			for (let column_name in p) {
				if (p[column_name] === null) {
					delete p[column_name];
				}
			}
			return new Project(p);
		});
	}
	/** get all projects */
	static async allTradesman(id) {
		const result = await db.query(
			`SELECT * FROM projects WHERE tradesmen_id=$1 ORDER BY created_at DESC`,
			[id]
		);
		return result.rows.map((p) => {
			// remove columns who's value is null
			for (let column_name in p) {
				if (p[column_name] === null) {
					delete p[column_name];
				}
			}
			return new Project(p);
		});
	}

	/** get project by id */
	static async get(id, user) {
		const result = await db.query(
			`SELECT *
      FROM projects
      WHERE id=$1`,
			[id]
		);

		const project = result.rows[0];

		if (project === undefined) {
			const err = new ExpressError(
				`Could not find Project id: ${id}`,
				404
			);
			throw err;
		}
		// can only look up projects you are involved with (either as user or tradesman)
		if (user.user_type === "user") {
			if (user.id !== project.user_id) {
				return new ExpressError(`Unauthorized`, 401);
			}
		} else {
			if (user.id !== project.tradesmen_id) {
				return new ExpressError(`Unauthorized`, 401);
			}
		}

		let p = new Project(project);
		// remove columns who's value is null
		for (let column_name in p) {
			if (p[column_name] === null) {
				delete p[column_name];
			}
		}

		return p;
	}

	/** update project
	 * - items: an object with keys of columns you want to update and values with updated values
	 */

	async update(items) {
		const updateData = Project.sqlForPartialUpdate(
			"projects",
			items,
			"id",
			this.id
		);
		let result;
		try {
			result = await db.query(updateData.query, updateData.values);
		} catch (error) {
			throw new ExpressError(error.message, 400);
		}
		let project = new Project(result.rows[0]);

		if (project === undefined) {
			const err = new ExpressError(
				`Could not find Project id: ${id}`,
				404
			);
			throw err;
		}
		return new Project(project);
	}

	/** remove project with matching id */
	static async remove(id) {
		let queryString = Project.sqlForDelete("projects", "id", id);
		const result = await db.query(queryString.query, [queryString.id]);

		if (result.rows.length === 0) {
			const err = new ExpressError(
				`Could not find project id: ${id}`,
				404
			);
			throw err;
		}
		return "deleted";
	}
}

module.exports = Project;
