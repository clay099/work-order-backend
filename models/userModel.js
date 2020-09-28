const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const sqlForDelete = require("../helpers/removeFromDB");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BCRYPT_WORK_FACTOR, JWT_SECRET_KEY } = require("../config");
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
	/** get user by username */
	static async get(id) {
		const result = await db.query(
			`SELECT id, first_name, last_name, email, phone, street_address, address_city, address_zip, address_country
        FROM users
        WHERE id=$1`,
			[id]
		);
		const user = result.rows[0];

		if (user === undefined) {
			const err = new ExpressError(
				`Could not find User username: ${username}`,
				404
			);
			throw err;
		}
		let u = new User(user);

		delete u.password;
		delete u.photo_url;
		delete u.is_admin;

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
		const updateData = sqlForPartialUpdate(
			"users",
			items,
			"username",
			this.username
		);
		const result = await db.query(updateData.query, updateData.values);
		let u = result.rows[0];

		// remove sensitive information
		delete u.password;

		return u;
	}

	/** remove user with matching username */
	static async remove(id) {
		let queryString = sqlForDelete("users", "id", id);
		const result = await db.query(queryString.query, [queryString.id]);

		if (result.rows.length === 0) {
			const err = new ExpressError(
				`Could not find user username: ${id}`,
				404
			);
			throw err;
		}
		return "deleted";
	}

	async authenticate(password) {
		if ((await bcrypt.compare(password, this.password)) === true) {
			let token = jwt.sign({ username: this.username }, JWT_SECRET_KEY);
			return token;
		}
		const err = new ExpressError(`Invalid username/password`, 400);
		throw err;
	}
}

module.exports = User;
