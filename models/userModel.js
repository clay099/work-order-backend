const db = require("../db");
const ExpressError = require("../helpers/expressError");
const createToken = require("../helpers/createToken");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BCRYPT_WORK_FACTOR } = require("../config");
const baseModel = require("./baseModel");

/**collection of related methods for user */

class User extends baseModel {
	constructor({
		id,
		first_name,
		last_name,
		email,
		phone,
		street_address,
		address_city,
		address_zip,
		address_country,
		password,
	}) {
		super();
		this.id = id;
		this.first_name = first_name;
		this.last_name = last_name;
		this.email = email;
		this.phone = phone;
		this.street_address = street_address;
		this.address_city = address_city;
		this.address_zip = address_zip;
		this.address_country = address_country;
		this.password = password;
	}

	/** creates a new user */
	static async create({
		first_name,
		last_name,
		email,
		phone,
		street_address,
		address_city,
		address_zip,
		address_country,
		password,
	}) {
		const hashedPW = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
		let result;
		try {
			let { query, values } = User.sqlForCreate(
				"users",
				{
					first_name,
					last_name,
					email,
					phone,
					street_address,
					address_city,
					address_zip,
					address_country,
					password: hashedPW,
				},
				[
					"id",
					"first_name",
					"last_name",
					"email",
					"phone",
					"street_address",
					"address_city",
					"address_zip",
					"address_country",
					"password",
				]
			);
			result = await db.query(query, values);
		} catch (error) {
			const err = new ExpressError(error.detail, 400);
			throw err;
		}
		const user = result.rows[0];

		if (user === undefined) {
			const err = new ExpressError("Could not create user", 400);
			throw err;
		}
		return new User(user);
	}
	/** get all users */
	static async all() {
		const result = await db.query(
			`SELECT id, first_name, last_name, email, phone, street_address, address_city, address_zip, address_country FROM users ORDER BY last_name, first_name`
		);
		return result.rows.map((u) => new User(u));
	}

	/** get user by id */
	static async get(id) {
		const result = await db.query(
			`SELECT id, first_name, last_name, email, phone, street_address, address_city, address_zip, address_country
      FROM users
      WHERE id=$1`,
			[id]
		);

		const user = result.rows[0];

		if (user === undefined) {
			const err = new ExpressError(`Could not find User id: ${id}`, 404);
			throw err;
		}
		let u = new User(user);

		delete u.password;

		return u;
	}

	/** get all user details by email */
	static async getAll(email) {
		const result = await db.query(`SELECT * FROM users WHERE email=$1`, [
			email,
		]);

		const user = result.rows[0];

		if (user === undefined) {
			const err = new ExpressError(
				`Could not find User email: ${email}`,
				404
			);
			throw err;
		}
		let u = new User(user);

		return u;
	}

	/** update user
	 * - items: an object with keys of columns you want to update and values with updated values
	 */

	async update(items) {
		if (items.password) {
			items.password = await bcrypt.hash(
				items.password,
				BCRYPT_WORK_FACTOR
			);
		}
		const updateData = User.sqlForPartialUpdate(
			"users",
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
		let u = new User(result.rows[0]);

		// remove sensitive information
		delete u.password;

		return u;
	}

	/** remove user with matching id */
	static async remove(id) {
		let queryString = User.sqlForDelete("users", "id", id);
		const result = await db.query(queryString.query, [queryString.id]);

		if (result.rows.length === 0) {
			const err = new ExpressError(`Could not find user id: ${id}`, 404);
			throw err;
		}
		return "deleted";
	}

	async authenticate(password) {
		if ((await bcrypt.compare(password, this.password)) !== true) {
			const err = new ExpressError(`Invalid email/password`, 400);
			throw err;
		}
		let token = createToken(this.email, this.id, "user");
		return token;
	}
}

module.exports = User;
