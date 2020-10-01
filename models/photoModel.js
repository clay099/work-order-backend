const db = require("../db");
const ExpressError = require("../helpers/expressError");
const baseModel = require("./baseModel");

/**collection of related methods for photo */

class Photo extends baseModel {
	constructor({ id, project_id, photo_link, description, after, user_id }) {
		super();
		this.id = id;
		this.project_id = project_id;
		this.photo_link = photo_link;
		this.description = description;
		this.after = after;
		this.user_id = user_id;
	}

	/** creates a new photo */
	static async create({
		project_id,
		photo_link,
		description,
		after,
		user_id,
	}) {
		let result;
		try {
			let { query, values } = Photo.sqlForCreate(
				"photos",
				{
					project_id,
					photo_link,
					description,
					after,
					user_id,
				},
				[
					"id",
					"project_id",
					"photo_link",
					"description",
					"after",
					"user_id",
				]
			);
			result = await db.query(query, values);
		} catch (error) {
			const err = new ExpressError(error.detail, 400);
			throw err;
		}
		const photo = result.rows[0];

		if (photo === undefined) {
			const err = new ExpressError("Could not create photo", 400);
			throw err;
		}
		return new Photo(photo);
	}
	/** get all photos */
	static async all() {
		const result = await db.query(
			`SELECT * FROM photos ORDER BY project_id`
		);
		return result.rows.map((p) => new Photo(p));
	}

	/** get photo by id */
	static async get(id) {
		const result = await db.query(
			`SELECT id, project_id, photo_link, description, after, user_id
      FROM photos
      WHERE id=$1`,
			[id]
		);

		const photo = result.rows[0];

		if (photo === undefined) {
			const err = new ExpressError(`Could not find photo id: ${id}`, 404);
			throw err;
		}
		return new Photo(photo);
	}

	/** get all photos details by project_id */
	static async getAll(project_id) {
		const result = await db.query(
			`SELECT * FROM photos WHERE project_id=$1`,
			[project_id]
		);

		if (result.rows[0] === undefined) {
			const err = new ExpressError(
				`Could not find Photos associated with Project id: ${project_id}`,
				404
			);
			throw err;
		}
		return result.rows.map((p) => new Photo(p));
	}

	/** update photo
	 * - items: an object with keys of columns you want to update and values with updated values
	 */

	async update(items) {
		const updateData = Photo.sqlForPartialUpdate(
			"photos",
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
		return new Photo(result.rows[0]);
	}

	/** remove photo with matching id */
	static async remove(id) {
		let queryString = Photo.sqlForDelete("photos", "id", id);
		const result = await db.query(queryString.query, [queryString.id]);

		if (result.rows.length === 0) {
			const err = new ExpressError(`Could not find photo id: ${id}`, 404);
			throw err;
		}
		return "deleted";
	}
}

module.exports = Photo;
