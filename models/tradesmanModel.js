const db = require("../db");
const ExpressError = require("../helpers/expressError");
const createToken = require("../helpers/createToken");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BCRYPT_WORK_FACTOR } = require("../config");
const baseModel = require("./baseModel");

/**collection of related methods for Tradesman */

class Tradesman extends baseModel {
	constructor({
		id,
		first_name,
		last_name,
		email,
		phone,
		password,
		rating,
		is_blocked,
	}) {
		super();
		this.id = id;
		this.first_name = first_name;
		this.last_name = last_name;
		this.email = email;
		this.phone = phone;
		this.password = password;
		this.rating = rating;
		this.is_blocked = is_blocked;
	}

	/** creates a new tradesman */
	static async create({ first_name, last_name, email, phone, password }) {
		const hashedPW = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
		let result;
		try {
			let { query, values } = Tradesman.sqlForCreate(
				"tradesmen",
				{
					first_name,
					last_name,
					email,
					phone,
					password: hashedPW,
				},
				["id", "first_name", "last_name", "email", "phone", "password"]
			);
			result = await db.query(query, values);
		} catch (error) {
			const err = new ExpressError(error.detail, 400);
			throw err;
		}
		const tradesman = result.rows[0];

		if (tradesman === undefined) {
			const err = new ExpressError("Could not create tradesman", 400);
			throw err;
		}
		return new Tradesman(tradesman);
	}
	/** get all tradesmen */
	static async all() {
		const result = await db.query(
			`SELECT id, first_name, last_name, email, phone FROM tradesmen ORDER BY last_name, first_name`
		);
		return result.rows.map((t) => new Tradesman(t));
	}

	/** get tradesman by id */
	static async get(id) {
		const result = await db.query(
			`SELECT id, first_name, last_name, email, phone
      FROM tradesmen
      WHERE id=$1`,
			[id]
		);

		const tradesman = result.rows[0];

		if (tradesman === undefined) {
			const err = new ExpressError(
				`Could not find tradesman id: ${id}`,
				404
			);
			throw err;
		}
		let t = new Tradesman(tradesman);

		delete tradesman.password;

		return t;
	}

	/** get all tradesman details by email */
	static async getAll(email) {
		const result = await db.query(
			`SELECT * FROM tradesmen WHERE email=$1`,
			[email]
		);

		const tradesman = result.rows[0];

		if (tradesman === undefined) {
			const err = new ExpressError(
				`Could not find tradesman email: ${email}`,
				404
			);
			throw err;
		}
		let t = new Tradesman(tradesman);

		return t;
	}

	/** update tradesman
	 * - items: an object with keys of columns you want to update and values with updated values
	 */

	async update(items) {
		if (items.password) {
			items.password = await bcrypt.hash(
				items.password,
				BCRYPT_WORK_FACTOR
			);
		}
		const updateData = Tradesman.sqlForPartialUpdate(
			"tradesmen",
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
		let tradesmanData = new Tradesman(result.rows[0]);

		// remove sensitive information
		delete tradesmanData.password;

		return tradesmanData;
	}

	/** remove tradesman with matching id */
	static async remove(id) {
		let queryString = Tradesman.sqlForDelete("tradesmen", "id", id);
		const result = await db.query(queryString.query, [queryString.id]);

		if (result.rows.length === 0) {
			const err = new ExpressError(
				`Could not find tradesman id: ${id}`,
				404
			);
			throw err;
		}
		return "deleted";
	}

	async authenticate(password) {
		if ((await bcrypt.compare(password, this.password)) === true) {
			let token = createToken(this.email, this.id, "tradesman");
			return token;
		}
		const err = new ExpressError(`Invalid email/password`, 400);
		throw err;
	}
}

module.exports = Tradesman;
