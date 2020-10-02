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

describe("GET /tradesmen", () => {
	it("gets a array of all tradesmen", async () => {
		const resp = await request(app).get("/tradesmen");
		expect(resp.statusCode).toBe(200);
		// delete object properties which don't show up when requesting all.
		delete TEST_DATA.tradesman.password;
		delete TEST_DATA.tradesman2.password;
		delete TEST_DATA.tradesman.is_blocked;
		delete TEST_DATA.tradesman2.is_blocked;
		delete TEST_DATA.tradesman.rating;
		delete TEST_DATA.tradesman2.rating;
		expect(resp.body).toEqual({
			tradesmen: [TEST_DATA.tradesman2, TEST_DATA.tradesman],
		});
	});
});

describe("POST /tradesmen", () => {
	it("creates a new tradesman", async () => {
		let tradesman = {
			first_name: "Jarvis",
			last_name: "Blick",
			email: "Jarvis.Blick28@gmail.com",
			phone: 9257485632,
			password: "password",
		};
		const resp = await await request(app)
			.post("/tradesmen")
			.send(tradesman);
		tradesman.id = expect.any(Number);
		tradesman.password = expect.any(String);
		tradesman.phone = expect.any(String);

		expect(resp.body.tradesman).toEqual(tradesman);
		expect(resp.body).toHaveProperty(`token`);
	});

	it("returns an error for each missing field", async () => {
		let resp = await request(app).post("/tradesmen");
		expect(resp.statusCode).toBe(400);
		let errorMessage = [
			'instance requires property "first_name"',
			'instance requires property "last_name"',
			'instance requires property "phone"',
			'instance requires property "email"',
			'instance requires property "password"',
		];
		expect(resp.body.error.message).toEqual(errorMessage);
	});

	it("returns an error for incorrect paramter type", async () => {
		let tradesman = {
			first_name: 1,
			last_name: 1,
			email: 1,
			phone: "9257485632",
			password: 1,
		};
		let resp = await request(app).post("/tradesmen").send(tradesman);
		expect(resp.statusCode).toBe(400);
		let errorMessage = [
			"instance.first_name is not of a type(s) string",
			"instance.last_name is not of a type(s) string",
			"instance.phone is not of a type(s) integer",
			"instance.email is not of a type(s) string",
			"instance.password is not of a type(s) string",
		];
		expect(resp.body.error.message).toEqual(errorMessage);
	});

	it("returns an error for email not being valid format", async () => {
		let tradesman = {
			first_name: "Jarvis",
			last_name: "Blick",
			email: "notValidEmailFormat",
			phone: 9257485632,
			password: "password",
		};
		let resp = await request(app).post("/tradesmen").send(tradesman);
		expect(resp.statusCode).toBe(400);
		expect(resp.body.error.message).toEqual(
			`notValidEmailFormat is not a valid email`
		);
	});
});

describe("GET /tradesmen/id", () => {
	it("gets one tradesmen data", async () => {
		const resp = await request(app).get(
			`/tradesmen/${TEST_DATA.tradesman.id}`
		);
		expect(resp.statusCode).toBe(200);
		delete TEST_DATA.tradesman.password;
		delete TEST_DATA.tradesman.rating;
		delete TEST_DATA.tradesman.is_blocked;
		expect(resp.body).toEqual({ tradesman: TEST_DATA.tradesman });
	});

	it("returns an error for invalid id", async () => {
		const resp = await request(app).get(`/tradesmen/987456321`);
		expect(resp.statusCode).toBe(404);
		expect(resp.body.error.message).toEqual(
			"Could not find tradesman id: 987456321"
		);
	});
});

describe("PATCH /tradesmen/id", () => {
	it("updates a tradesman", async () => {
		let updateData = {
			_token: TEST_DATA.tradesmanToken,
			first_name: "updated",
		};
		const resp = await request(app)
			.patch(`/tradesmen/${TEST_DATA.tradesman.id}`)
			.send(updateData);
		expect(resp.statusCode).toBe(200);
		TEST_DATA.tradesman.first_name = updateData.first_name;
		delete TEST_DATA.tradesman.password;
		expect(resp.body.tradesman).toEqual(TEST_DATA.tradesman);
		expect(resp.body).toHaveProperty(`token`);
	});

	it("returns an error if TradesmanToken does not match", async () => {
		let updateData = {
			_token: TEST_DATA.tradesman2Token,
			first_name: "updated",
		};
		const resp = await request(app)
			.patch(`/tradesmen/${TEST_DATA.tradesman.id}`)
			.send(updateData);
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});

	it("returns an error for incorrect paramter type", async () => {
		let tradesman = {
			first_name: 1,
			last_name: 1,
			email: 1,
			phone: "9257485632",
			password: 1,
		};
		let resp = await request(app)
			.patch(`/tradesmen/${TEST_DATA.tradesman.id}`)
			.send({ _token: TEST_DATA.tradesmanToken, ...tradesman });
		expect(resp.statusCode).toBe(400);
		let errorMessage = [
			"instance.first_name is not of a type(s) string",
			"instance.last_name is not of a type(s) string",
			"instance.phone is not of a type(s) integer",
			"instance.email is not of a type(s) string",
			"instance.password is not of a type(s) string",
		];
		expect(resp.body.error.message).toEqual(errorMessage);
	});

	it("returns an error for email not being valid format", async () => {
		let resp = await request(app)
			.patch(`/tradesmen/${TEST_DATA.tradesman.id}`)
			.send({
				_token: TEST_DATA.tradesmanToken,
				email: "notValidEmailFormat",
			});
		expect(resp.statusCode).toBe(400);
		expect(resp.body.error.message).toEqual(
			`notValidEmailFormat is not a valid email`
		);
	});

	it("returns an error if you try to update the tradesman id", async () => {
		let resp = await request(app)
			.patch(`/tradesmen/${TEST_DATA.tradesman.id}`)
			.send({
				_token: TEST_DATA.tradesmanToken,
				id: 1000,
			});
		expect(resp.statusCode).toBe(400);
		expect(resp.body.error.message).toEqual(`Not allowed to change 'ID'`);
	});
});

describe("DELETE /tradesmen/id", () => {
	it("deletes a tradesman", async () => {
		const resp = await request(app)
			.delete(`/tradesmen/${TEST_DATA.tradesman.id}`)
			.send({ _token: TEST_DATA.tradesmanToken });
		expect(resp.statusCode).toBe(200);
		expect(resp.body.message).toEqual("Tradesman deleted");
	});

	it("returns an error if tradesmanToken does not match", async () => {
		const resp = await request(app)
			.delete(`/tradesmen/${TEST_DATA.tradesman.id}`)
			.send({ _token: TEST_DATA.tradesman2Token });
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
