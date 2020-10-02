process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../../app");
const db = require("../../db");
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

describe("POST /reviews", () => {
	let num;
	let completedProject;
	let random_num = (num = 100) => {
		return Math.floor(Math.random() * num);
	};
	beforeEach(async function () {
		num = random_num();
		// create new project as project can only have one review
		let resp = await db.query(
			"INSERT INTO projects (user_id, description, street_address, address_city, address_zip, address_country, price, tradesmen_id, status, completed_at, issues) VALUES ($1, $2, '1 Sacramento Street', 'Sacramento', 98756, 'USA', 500, $3, 'completed', current_timestamp, 'paint different color') RETURNING *",
			[TEST_DATA.user.id, `new Project${num}`, TEST_DATA.tradesman.id]
		);
		completedProject = resp.rows[0];
	});

	it("creates a new project review as project user", async () => {
		let data = {
			_token: TEST_DATA.userToken,
			project_id: completedProject.id,
			review_comment: "great work!",
			review_rating: 9,
		};
		let resp = await request(app).post(`/reviews`).send(data);
		expect(resp.statusCode).toBe(201);
		expect(resp.body.review.review_comment).toEqual(data.review_comment);
		expect(Object.keys(resp.body.review)).toHaveLength(5);
	});

	it("returns an error if the tradesman tries to provide project review", async () => {
		let data = {
			_token: TEST_DATA.tradesmanToken,
			project_id: completedProject.id,
			review_comment: "great work!",
			review_rating: 9,
		};
		let resp = await request(app).post(`/reviews`).send(data);
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});

	it("returns an error for each missing field", async () => {
		let data = {
			_token: TEST_DATA.userToken,
		};
		let resp = await request(app).post(`/reviews`).send(data);
		expect(resp.statusCode).toBe(400);
		let errorMessage = [
			'instance requires property "project_id"',
			'instance requires property "review_rating"',
		];
		expect(resp.body.error.message).toEqual(errorMessage);
	});

	it("returns an error for incorrect paramter type", async () => {
		let data = {
			_token: TEST_DATA.userToken,
			project_id: "id",
			review_comment: 1,
			review_rating: "9",
		};
		let resp = await request(app).post(`/reviews`).send(data);
		expect(resp.statusCode).toBe(400);

		let errorMessage = [
			"instance.project_id is not of a type(s) integer",
			"instance.review_comment is not of a type(s) string",
			"instance.review_rating is not of a type(s) integer",
		];
		expect(resp.body.error.message).toEqual(errorMessage);
	});

	it("returns an error no one is logged in", async () => {
		let data = {
			project_id: completedProject.id,
			review_comment: "great work!",
			review_rating: 9,
		};
		let resp = await request(app).post(`/reviews`).send(data);
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual(`Unauthorized`);
	});

	it("returns an error if user tries to provide project review for a project they are not involved with", async () => {
		let data = {
			_token: TEST_DATA.user2Token,
			project_id: completedProject.id,
			review_comment: "great work!",
			review_rating: 9,
		};
		let resp = await request(app).post(`/reviews`).send(data);
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual(`Unauthorized`);
	});
});

describe("GET /reviews/id", () => {
	it("gets project review as user", async () => {
		let resp = await request(app)
			.get(`/reviews/${TEST_DATA.completedProject1.id}`)
			.send({ _token: TEST_DATA.userToken });
		expect(resp.statusCode).toBe(200);
		expect(resp.body.review).toHaveProperty("review_comment");
	});

	it("gets project review as tradesman", async () => {
		let resp = await request(app)
			.get(`/reviews/${TEST_DATA.completedProject1.id}`)
			.send({ _token: TEST_DATA.tradesmanToken });
		expect(resp.statusCode).toBe(200);
		expect(resp.body.review).toHaveProperty("review_comment");
	});

	it("returns an error when no one is logged in", async () => {
		let resp = await request(app).get(
			`/reviews/${TEST_DATA.completedProject1.id}`
		);
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});
});

describe("PATCH /reviews/id", () => {
	it("updates a project review as user", async () => {
		let data = {
			_token: TEST_DATA.userToken,
			review_comment: "updated",
		};
		let resp = await request(app)
			.patch(`/reviews/${TEST_DATA.completedProject1.id}`)
			.send(data);
		expect(resp.statusCode).toBe(200);
		expect(resp.body.review.review_comment).toEqual(data.review_comment);
	});

	it("returns an error for incorrect paramter type", async () => {
		let data = {
			_token: TEST_DATA.userToken,
			review_comment: 1,
			review_rating: "9",
		};
		let resp = await request(app)
			.patch(`/reviews/${TEST_DATA.completedProject1.id}`)
			.send(data);
		expect(resp.statusCode).toBe(400);
		expect(resp.body.error.message).toEqual([
			"instance.review_comment is not of a type(s) string",
			"instance.review_rating is not of a type(s) integer",
		]);
	});

	it("returns an error if user tries to update the review user_id, tradesmen_id or project_id", async () => {
		let data = {
			_token: TEST_DATA.userToken,
			user_id: 10,
			tradesmen_id: 10,
			project_id: 10,
		};
		let resp = await request(app)
			.patch(`/reviews/${TEST_DATA.completedProject1.id}`)
			.send(data);
		expect(resp.statusCode).toBe(400);
		expect(resp.body.error.message).toEqual(
			"Not allowed to change 'user_id', 'tradesmen_id' or 'project_id'"
		);
	});

	it("returns an error if user tries to update project review for a project they are not involved with", async () => {
		let data = {
			_token: TEST_DATA.user2Token,
			review_comment: "updated",
		};
		let resp = await request(app)
			.patch(`/reviews/${TEST_DATA.completedProject1.id}`)
			.send(data);
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});

	it("returns an error if the tradesman tries to update the project review", async () => {
		let data = {
			_token: TEST_DATA.tradesmanToken,
			review_comment: "updated",
		};
		let resp = await request(app)
			.patch(`/reviews/${TEST_DATA.completedProject1.id}`)
			.send(data);
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});

	it("returns an error if no one is logged in", async () => {
		let data = {
			review_comment: "updated",
		};
		let resp = await request(app)
			.patch(`/reviews/${TEST_DATA.completedProject1.id}`)
			.send(data);
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});
});

describe("DELETE /reviews/id", () => {
	it("deletes project review with correct user", async () => {
		let resp = await request(app)
			.delete(`/reviews/${TEST_DATA.completedProject1.id}`)
			.send({ _token: TEST_DATA.userToken });
		expect(resp.statusCode).toBe(200);
		expect(resp.body.message).toEqual("review deleted");
	});

	it("returns an error is user is not involved", async () => {
		let resp = await request(app)
			.delete(`/reviews/${TEST_DATA.completedProject1.id}`)
			.send({ _token: TEST_DATA.user2Token });
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});

	it("returns an error when tradesman tries to delete review", async () => {
		let resp = await request(app)
			.delete(`/reviews/${TEST_DATA.completedProject1.id}`)
			.send({ _token: TEST_DATA.tradesmanToken });
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});

	it("returns an error when no one is logged in", async () => {
		let resp = await request(app).delete(
			`/reviews/${TEST_DATA.completedProject1.id}`
		);
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
