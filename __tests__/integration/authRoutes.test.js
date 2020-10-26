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

describe("POST /login/user", () => {
	it("logs in a user with valid details", async () => {
		let resp = await request(app).post("/login/user").send({
			email: TEST_DATA.user.email,
			password: "secret",
		});
		expect(resp.statusCode).toBe(200);
		expect(resp.body).toHaveProperty("token");
	});

	it("returns an error if user can't be found", async () => {
		let resp = await request(app).post("/login/user").send({
			email: "notStoredEmail@gmail.com",
			password: "secret",
		});
		expect(resp.statusCode).toBe(404);
		expect(resp.body.error.message).toEqual(
			"Could not find User email: notStoredEmail@gmail.com"
		);
	});

	it("returns an error if username and password can't be authenticated", async () => {
		let resp = await request(app).post("/login/user").send({
			email: TEST_DATA.user.email,
			password: "invalid",
		});
		expect(resp.statusCode).toBe(400);
		expect(resp.body.error.message).toEqual("Invalid email/password");
	});
});

describe("POST /login/tradesmen", () => {
	it("logs in a tradesman with valid details", async () => {
		let resp = await request(app).post("/login/tradesmen").send({
			email: TEST_DATA.tradesman.email,
			password: "secret",
		});
		expect(resp.statusCode).toBe(200);
		expect(resp.body).toHaveProperty("token");
	});

	it("returns an error if tradesman can't be found", async () => {
		let resp = await request(app).post("/login/tradesmen").send({
			email: "notStoredEmail@gmail.com",
			password: "secret",
		});
		expect(resp.statusCode).toBe(404);
		expect(resp.body.error.message).toEqual(
			"Could not find tradesman email: notStoredEmail@gmail.com"
		);
	});

	it("returns an error if username and password can't be authenticated", async () => {
		let resp = await request(app).post("/login/tradesmen").send({
			email: TEST_DATA.tradesman.email,
			password: "invalid",
		});
		expect(resp.statusCode).toBe(400);
		expect(resp.body.error.message).toEqual("Invalid email/password");
	});
});

describe("POST /login/tradesmen", () => {
	it("", async () => {});
});

afterEach(async function () {
	await afterEachHook();
});

afterAll(async function () {
	await afterAllHook();
});
