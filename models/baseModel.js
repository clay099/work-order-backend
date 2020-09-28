class baseModel {
	/**
	 * Generate a selective update query based on a request body:
	 *
	 * - table: where to make the query
	 * - items: an object with keys of columns you want to update and values with updated values
	 * - key: the column that we query by (e.g. username, handle, id)
	 * - id: current record ID
	 *
	 * Returns object containing a DB query as a string, and array of
	 * string values to be updated
	 *
	 */

	sqlForPartialUpdate(table, items, key, id) {
		// keep track of item indexes
		// store all the columns we want to update and associate with vals

		let idx = 1;
		let columns = [];

		// filter out keys that start with "_" -- we don't want these in DB
		for (let key in items) {
			if (key.startsWith("_")) {
				delete items[key];
			}
		}

		for (let column in items) {
			columns.push(`${column}=$${idx}`);
			idx += 1;
		}

		// build query
		let cols = columns.join(", ");
		let query;
		if (Array.isArray(key)) {
			query = `UPDATE ${table} SET ${cols} WHERE ${key[0]}=$${idx} AND ${
				key[1]
			}=$${idx + 1} RETURNING *`;
		} else {
			query = `UPDATE ${table} SET ${cols} WHERE ${key}=$${idx} RETURNING *`;
		}

		let values = Object.values(items);

		if (Array.isArray(id)) {
			values.push(id[0]);
			values.push(id[1]);
		} else {
			values.push(id);
		}

		return { query, values };
	}

	/**
	 * Generate a selective create query based on a request body:
	 *
	 * - table: where to make the query
	 * - items: an object with keys of columns you want to create and values with new values
   * - returning: an array of values to be returned
	 *
	 * Returns object containing a DB query as a string, an array of string values to be updated
	 *
	 */

	static sqlForCreate(table, items, returning) {
		// keep track of item indexes
		// store all the columns we want to update and associate with vals

		let idx = 1;
		let columns = [];
		let valuesIdx = [];

		// filter out keys that start with "_" -- we don't want these in DB
		for (let key in items) {
			if (key.startsWith("_")) {
				delete items[key];
			}
		}

		for (let column in items) {
			columns.push(`${column}`);
			valuesIdx.push(`$${idx}`);
			idx += 1;
		}

		// build query
		let cols = columns.join(", ");
		let vals = valuesIdx.join(", ");
		returning = returning.join(", ");
		let query = `INSERT INTO ${table} (${cols}) VALUES (${vals}) RETURNING ${returning}`;

		let values = Object.values(items);

		return { query, values, returning };
	}
}

module.exports = baseModel;
