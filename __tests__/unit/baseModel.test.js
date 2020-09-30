const baseModel = require("../../models/baseModel");

let model = new baseModel();

describe("model.sqlForCreate()", () => {
	it("should generate proper sql query to create a new user", () => {
		let table = "users";
		let items = { first_name: "John", last_name: "Smith" };
		let returning = ["first_name", "last_name"];
		// debugger;
		const { query, values } = model.constructor.sqlForCreate(
			table,
			items,
			returning
		);

		expect(query).toEqual(
			`INSERT INTO users (first_name, last_name) VALUES ($1, $2) RETURNING first_name, last_name`
		);

		expect(values).toEqual(["John", "Smith"]);
	});
});

describe("model.sqlForPartialUpdate()", () => {
	it("should generate proper sql query to update a user", () => {
		let table = "users";
		let items = { first_name: "UpdatedJohn", last_name: "UpdatedSmith" };
		let key = "id";
		let id = 1;
		// debugger;
		const { query, values } = model.constructor.sqlForPartialUpdate(
			table,
			items,
			key,
			id
		);

		expect(query).toEqual(
			`UPDATE users SET first_name=$1, last_name=$2 WHERE id=$3 RETURNING *`
		);

		expect(values).toEqual(["UpdatedJohn", "UpdatedSmith", 1]);
	});
});

describe("model.sqlForDelete()", () => {
	it("should generate proper sql query to delete a user", () => {
		let table = "users";
		let key = "id";
		let id = [1];
		// debugger;
		const { query, id: returnedId } = model.constructor.sqlForDelete(
			table,
			key,
			id
		);

		expect(query).toEqual(`DELETE FROM users WHERE id=$1 RETURNING *`);

		expect(returnedId).toEqual([id]);
	});
});
