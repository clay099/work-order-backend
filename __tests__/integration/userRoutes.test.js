process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../../app");
// removes console.error & console.log from appearing in terminal
console.error = jest.fn();
console.log = jest.fn();

const {
	TEST_DATA,
	afterEachHook,
	afterAllHook,
	beforeAllHook,
	beforeEachHook,
} = require("../../testConfig");

beforeAll(async function () {
	await beforeAllHook();
});

beforeEach(async function () {
	await beforeEachHook(TEST_DATA);
});

describe("GET /users", () => {
	it("gets a array of all users", async () => {
		const resp = await request(app).get("/users");
		expect(resp.statusCode).toBe(200);
		delete TEST_DATA.user2.password;
		delete TEST_DATA.user.password;
		expect(resp.body).toEqual({ users: [TEST_DATA.user2, TEST_DATA.user] });
	});
});

describe("POST /users", () => {
	it("creates a new user", async () => {
		let user = {
			first_name: "Ron",
			last_name: "Lubowitz",
			email: "Ron.Lubowitz57@yahoo.com",
			phone: 3058748592,
			street_address: "20662 Lacey Trail",
			address_city: "San Francisco",
			address_zip: 94563,
			address_country: "United States of America",
			password: "password",
		};
		const resp = await await request(app).post("/users").send(user);
		expect(resp.statusCode).toBe(201);
		user.password = expect.any(String);
		user.phone = expect.any(String);
		user.id = expect.any(Number);
		expect(resp.body.user).toEqual(user);
		expect(resp.body).toHaveProperty(`token`);
	});

	it("returns an error for each missing fields", async () => {
		let resp = await request(app).post("/users");
		expect(resp.statusCode).toBe(400);
		let errorMessage = [
			'instance requires property "first_name"',
			'instance requires property "last_name"',
			'instance requires property "email"',
			'instance requires property "phone"',
			'instance requires property "street_address"',
			'instance requires property "address_city"',
			'instance requires property "address_zip"',
			'instance requires property "address_country"',
			'instance requires property "password"',
		];
		expect(resp.body.error.message).toEqual(errorMessage);
	});

	it("returns an error for incorrect paramter type", async () => {
		let user = {
			first_name: 1,
			last_name: 1,
			email: 1,
			phone: "3058748592",
			street_address: 1,
			address_city: 1,
			address_zip: "1",
			address_country: 1,
			password: 1,
		};
		let resp = await request(app).post("/users").send(user);
		expect(resp.statusCode).toBe(400);
		let errorMessage = [
			"instance.first_name is not of a type(s) string",
			"instance.last_name is not of a type(s) string",
			"instance.email is not of a type(s) string",
			"instance.phone is not of a type(s) integer",
			"instance.street_address is not of a type(s) string",
			"instance.address_city is not of a type(s) string",
			"instance.address_zip is not of a type(s) integer",
			"instance.address_country is not of a type(s) string",
			"instance.password is not of a type(s) string",
		];
		expect(resp.body.error.message).toEqual(errorMessage);
	});

	it("returns an error for email not being valid format", async () => {
		let user = {
			first_name: "Ron",
			last_name: "Lubowitz",
			email: "notValidEmailFormat",
			phone: 3058748592,
			street_address: "20662 Lacey Trail",
			address_city: "San Francisco",
			address_zip: 94563,
			address_country: "United States of America",
			password: "password",
		};
		let resp = await request(app).post("/users").send(user);
		expect(resp.statusCode).toBe(400);
		expect(resp.body.error.message).toEqual(
			`notValidEmailFormat is not a valid email`
		);
	});
});

describe("GET /users/id", () => {
	it("gets one user data", async () => {
		const resp = await request(app).get(`/users/${TEST_DATA.user.id}`);
		expect(resp.statusCode).toBe(200);
		delete TEST_DATA.user.password;
		expect(resp.body).toEqual({ user: TEST_DATA.user });
	});

	it("returns an error for invalid id", async () => {
		const resp = await request(app).get(`/users/987456321`);
		expect(resp.statusCode).toBe(404);
		expect(resp.body.error.message).toEqual(
			"Could not find User id: 987456321"
		);
	});
});

describe("PATCH /users/id", () => {
	it("updates a user", async () => {
		let updateData = {
			_token: TEST_DATA.userToken,
			first_name: "updated",
		};
		const resp = await request(app)
			.patch(`/users/${TEST_DATA.user.id}`)
			.send(updateData);
		expect(resp.statusCode).toBe(200);
		TEST_DATA.user.first_name = updateData.first_name;
		delete TEST_DATA.user.password;
		expect(resp.body.user).toEqual(TEST_DATA.user);
		expect(resp.body).toHaveProperty(`token`);
	});

	it("returns an error if userToken does not match", async () => {
		let updateData = {
			_token: TEST_DATA.user2Token,
			first_name: "updated",
		};
		const resp = await request(app)
			.patch(`/users/${TEST_DATA.user.id}`)
			.send(updateData);
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});

	it("returns an error for incorrect paramter type", async () => {
		let user = {
			first_name: 1,
			last_name: 1,
			email: 1,
			phone: "3058748592",
			street_address: 1,
			address_city: 1,
			address_zip: "1",
			address_country: 1,
			password: 1,
		};
		let resp = await request(app)
			.patch(`/users/${TEST_DATA.user.id}`)
			.send({ _token: TEST_DATA.userToken, ...user });
		expect(resp.statusCode).toBe(400);
		let errorMessage = [
			"instance.first_name is not of a type(s) string",
			"instance.last_name is not of a type(s) string",
			"instance.email is not of a type(s) string",
			"instance.phone is not of a type(s) integer",
			"instance.street_address is not of a type(s) string",
			"instance.address_city is not of a type(s) string",
			"instance.address_zip is not of a type(s) integer",
			"instance.address_country is not of a type(s) string",
			"instance.password is not of a type(s) string",
		];
		expect(resp.body.error.message).toEqual(errorMessage);
	});

	it("returns an error for email not being valid format", async () => {
		let resp = await request(app)
			.patch(`/users/${TEST_DATA.user.id}`)
			.send({
				_token: TEST_DATA.userToken,
				email: "notValidEmailFormat",
			});
		expect(resp.statusCode).toBe(400);
		expect(resp.body.error.message).toEqual(
			`notValidEmailFormat is not a valid email`
		);
	});

	it("returns an error if you try to update the user id", async () => {
		let resp = await request(app)
			.patch(`/users/${TEST_DATA.user.id}`)
			.send({
				_token: TEST_DATA.userToken,
				id: 1000,
			});
		expect(resp.statusCode).toBe(400);
		expect(resp.body.error.message).toEqual(`Not allowed to change 'ID'`);
	});
});

describe("DELETE /user/id", () => {
	it("deletes a user", async () => {
		const resp = await request(app)
			.delete(`/users/${TEST_DATA.user.id}`)
			.send({ _token: TEST_DATA.userToken });
		expect(resp.statusCode).toBe(200);
		expect(resp.body.message).toEqual("User deleted");
	});

	it("returns an error if userToken does not match", async () => {
		const resp = await request(app)
			.delete(`/users/${TEST_DATA.user.id}`)
			.send({ _token: TEST_DATA.user2Token });
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});
});

afterEach(async function () {
	await afterEachHook();
});

afterAll(async function () {
	await afterAllHook();
});
