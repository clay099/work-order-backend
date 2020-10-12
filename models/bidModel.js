const db = require("../db");
const ExpressError = require("../helpers/expressError");
const baseModel = require("./baseModel");

/**collection of related methods for Bid */

class Bid extends baseModel {
	constructor({ id, project_id, tradesmen_id, bid, first_name, last_name }) {
		super();
		this.id = id;
		this.project_id = project_id;
		this.tradesmen_id = tradesmen_id;
		this.bid = bid;
		(this.first_name = first_name), (this.last_name = last_name);
	}

	/** creates a new bid */
	static async create({ project_id, tradesmen_id, bid }) {
		let result;
		try {
			let items = {
				project_id,
				tradesmen_id,
				bid,
			};
			let returning = ["project_id", "tradesmen_id", "bid"];

			let { query, values } = Bid.sqlForCreate("bids", items, returning);
			result = await db.query(query, values);
		} catch (error) {
			const err = new ExpressError(error.detail, 400);
			throw err;
		}
		const bidData = result.rows[0];

		if (bidData === undefined) {
			const err = new ExpressError("Could not create bid", 400);
			throw err;
		}
		return new Bid(bidData);
	}

	/** get all bids by projects */
	static async getProjectBids(id, user) {
		const result = await db.query(
			`SELECT b.bid, t.first_name, t.last_name, b.tradesmen_id, b.project_id
      FROM bids b
      LEFT JOIN tradesmen t 
      ON t.id=b.tradesmen_id
      WHERE project_id=$1 ORDER BY bid`,
			[id]
		);

		if (result.rows[0] === undefined) {
			const err = new ExpressError(
				`Could not find any bids for project id: ${id}`,
				404
			);
			throw err;
		}
		console.log(result.rows[0]);
		return result.rows.map((b) => new Bid(b));
	}

	/** get bid by id */
	static async get(id) {
		const result = await db.query(
			`SELECT *
      FROM bids
      WHERE id=$1`,
			[id]
		);

		const bidData = result.rows[0];

		if (bidData === undefined) {
			const err = new ExpressError(`Could not find bid id: ${id}`, 404);
			throw err;
		}
		return new Bid(bidData);
	}

	/** update Bid
	 * - items: an object with keys of columns you want to update and values with updated values
	 */

	async update(items) {
		const updateData = Bid.sqlForPartialUpdate(
			"bids",
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
		let bid = new Bid(result.rows[0]);

		if (bid === undefined) {
			const err = new ExpressError(`Could not find bid id: ${id}`, 404);
			throw err;
		}
		return bid;
	}

	/** remove bid with matching id */
	static async remove(id) {
		let queryString = Bid.sqlForDelete("bids", "id", id);
		const result = await db.query(queryString.query, [queryString.id]);

		if (result.rows.length === 0) {
			const err = new ExpressError(`Could not find bid id: ${id}`, 404);
			throw err;
		}
		return "deleted";
	}
}

module.exports = Bid;
