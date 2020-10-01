const db = require("../db");
const ExpressError = require("../helpers/expressError");
const baseModel = require("./baseModel");

/**collection of related methods for Chat */

class Review extends baseModel {
	constructor({
		user_id,
		tradesmen_id,
		project_id,
		review_comment,
		review_rating,
	}) {
		super();
		this.user_id = user_id;
		this.tradesmen_id = tradesmen_id;
		this.project_id = project_id;
		this.review_comment = review_comment;
		this.review_rating = review_rating;
	}

	/** creates a new chat message */
	static async create({
		user_id,
		tradesmen_id,
		project_id,
		review_comment,
		review_rating,
	}) {
		let result;
		try {
			let { query, values } = Review.sqlForCreate(
				"reviews",
				{
					user_id,
					tradesmen_id,
					project_id,
					review_comment,
					review_rating,
				},
				[
					"user_id",
					"tradesmen_id",
					"project_id",
					"review_comment",
					"review_rating",
				]
			);
			result = await db.query(query, values);
		} catch (error) {
			const err = new ExpressError(error.detail, 400);
			throw err;
		}
		const review = result.rows[0];

		if (review === undefined) {
			const err = new ExpressError("Could not create review", 400);
			throw err;
		}
		return new Review(review);
	}

	/** get all review */
	static async all() {
		const result = await db.query(`SELECT * FROM reviews`);
		return result.rows.map((r) => new Review(r));
	}

	/** get review by id */
	static async get(project_id) {
		const result = await db.query(
			`SELECT *
      FROM reviews
      WHERE project_id=$1`,
			[project_id]
		);

		const review = result.rows[0];

		if (review === undefined) {
			const err = new ExpressError(
				`Could not find review for project id: ${project_id}`,
				404
			);
			throw err;
		}
		return new Review(review);
	}

	/** update Review
	 * - items: an object with keys of columns you want to update and values with updated values
	 */

	async update(items) {
		const updateData = Review.sqlForPartialUpdate(
			"reviews",
			items,
			"project_id",
			this.project_id
		);
		let result;
		try {
			result = await db.query(updateData.query, updateData.values);
		} catch (error) {
			throw new ExpressError(error.message, 400);
		}
		let review = result.rows[0];

		if (review === undefined) {
			const err = new ExpressError(
				`Could not find review id: ${id}`,
				404
			);
			throw err;
		}
		return new Review(review);
	}

	/** remove review with matching id */
	static async remove(project_id) {
		let queryString = Review.sqlForDelete(
			"reviews",
			"project_id",
			project_id
		);
		const result = await db.query(queryString.query, [queryString.id]);

		if (result.rows.length === 0) {
			const err = new ExpressError(
				`Could not find review project id: ${project_id}`,
				404
			);
			throw err;
		}
		return "deleted";
	}
}

module.exports = Review;
