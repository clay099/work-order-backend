const db = require("../db");
const ExpressError = require("../helpers/expressError");
const baseModel = require("./baseModel");

/**collection of related methods for Chat */

class Chat extends baseModel {
	constructor({ id, project_id, user_id, tradesmen_id, comment, sent_at }) {
		super();
		this.id = id;
		this.project_id = project_id;
		this.user_id = user_id;
		this.tradesmen_id = tradesmen_id;
		this.comment = comment;
		this.sent_at = sent_at;
	}

	/** creates a new chat message */
	static async create({ project_id, user_id, comment, user_type }) {
		let result;
		try {
			let items;
			let returning;
			if (user_type === "user") {
				items = {
					project_id,
					user_id,
					comment,
				};
				returning = ["id", "project_id", "user_id", "comment"];
			} else {
				items = {
					project_id,
					tradesmen_id,
					comment,
				};
				returning = [
					"id",
					"project_id",
					"tradesmen_id",
					"comment",
					"sent_at",
				];
			}
			let { query, values } = Chat.sqlForCreate("chat", items, returning);
			result = await db.query(query, values);
		} catch (error) {
			const err = new ExpressError(error.detail, 400);
			throw err;
		}
		const chat = result.rows[0];

		if (chat === undefined) {
			const err = new ExpressError("Could not create comment", 400);
			throw err;
		}
		return new Chat(chat);
	}

	/** get all chats */
	static async all() {
		const result = await db.query(`SELECT * FROM chat ORDER BY sent_at`);
		return result.rows.map((p) => new Chat(p));
	}

	/** get all chats by projects */
	static async getProjectChat(id, user) {
		const result = await db.query(
			`SELECT * FROM chat WHERE project_id=$1 ORDER BY sent_at DESC`,
			[id]
		);

		if (result.rows[0] === undefined) {
			const err = new ExpressError(
				`Could not find chat with project id: ${id}`,
				404
			);
			throw err;
		}
		// can only look up projects you are involved with (either as user or tradesman)
		let valid = false;
		if (user.user_type === "user") {
			for (let chat of result.rows) {
				if (user.id === chat.user_id) {
					valid = true;
				}
			}
		} else {
			for (let chat of result.rows) {
				if (user.id === chat.tradesmen_id) {
					valid = true;
				}
			}
		}
		// if in all of the chats the user was not involved return user is unauthorized to access
		if (!valid) return new ExpressError(`Unauthorized`, 401);

		return result.rows.map((p) => new Chat(p));
	}

	/** get all chats by projects */
	static async getUserChat(user) {
		let query;
		if (user.user_type === "user") {
			query = `SELECT * FROM chat WHERE user_id=$1 ORDER BY sent_at DESC`;
		} else {
			query = `SELECT * FROM chat WHERE tradesmen_id=$1 ORDER BY sent_at DESC`;
		}

		const result = await db.query(query, [user.id]);

		if (result.rows[0] === undefined) {
			const err = new ExpressError(
				`Could not find chat with project id: ${id}`,
				404
			);
			throw err;
		}
		return result.rows.map((p) => new Chat(p));
	}

	/** get chat by id */
	static async get(id) {
		const result = await db.query(
			`SELECT *
      FROM chat
      WHERE id=$1`,
			[id]
		);

		const chatMessage = result.rows[0];

		if (chatMessage === undefined) {
			const err = new ExpressError(`Could not find chat id: ${id}`, 404);
			throw err;
		}
		return new Chat(chatMessage);
	}

	/** update Chat
	 * - items: an object with keys of columns you want to update and values with updated values
	 */

	async update(items) {
		const updateData = Chat.sqlForPartialUpdate(
			"chat",
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
		let chat = new Chat(result.rows[0]);

		if (chat === undefined) {
			const err = new ExpressError(`Could not find chat id: ${id}`, 404);
			throw err;
		}
		return new Chat(chat);
	}

	/** remove chat with matching id */
	static async remove(id) {
		let queryString = Chat.sqlForDelete("chat", "id", id);
		const result = await db.query(queryString.query, [queryString.id]);

		if (result.rows.length === 0) {
			const err = new ExpressError(`Could not find chat id: ${id}`, 404);
			throw err;
		}
		return "deleted";
	}
}

module.exports = Chat;
