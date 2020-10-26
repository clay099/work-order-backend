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

describe("POST /chat", () => {
	it("adds chat to project with logged in user", async () => {
		let data = {
			_token: TEST_DATA.userToken,
			project_id: TEST_DATA.completedProject1.id,
			comment: "newComment",
		};
		let resp = await request(app).post(`/chat`).send(data);
		expect(resp.statusCode).toBe(201);
		expect(resp.body.chat).toHaveProperty("id");
		expect(resp.body.chat).toHaveProperty("user_id");
		expect(resp.body.chat).not.toHaveProperty("tradesmen_id");
	});

	it("adds chat to project with logged in tradesman", async () => {
		let data = {
			_token: TEST_DATA.tradesmanToken,
			project_id: TEST_DATA.completedProject1.id,
			comment: "newComment",
		};
		let resp = await request(app).post(`/chat`).send(data);
		expect(resp.statusCode).toBe(201);
		expect(resp.body.chat).toHaveProperty("id");
		expect(resp.body.chat).toHaveProperty("tradesmen_id");
		expect(resp.body.chat).not.toHaveProperty("user_id");
	});

	it("returns an error for each missing field", async () => {
		let data = { _token: TEST_DATA.tradesmanToken };
		let resp = await request(app).post(`/chat`).send(data);
		expect(resp.statusCode).toBe(400);
		let errorMessage = [
			'instance requires property "project_id"',
			'instance requires property "comment"',
		];
		expect(resp.body.error.message).toEqual(errorMessage);
	});

	it("returns an error for incorrect paramter type", async () => {
		let data = {
			_token: TEST_DATA.userToken,
			project_id: "1",
			comment: 1,
		};
		let resp = await request(app).post(`/chat`).send(data);
		expect(resp.statusCode).toBe(400);
		let errorMessage = [
			"instance.project_id is not of a type(s) integer",
			"instance.comment is not of a type(s) string",
		];
		expect(resp.body.error.message).toEqual(errorMessage);
	});

	it("returns an error if no user is logged in", async () => {
		let data = {
			project_id: TEST_DATA.completedProject1.id,
			comment: "newComment",
		};
		let resp = await request(app).post(`/chat`).send(data);
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});
});

describe("GET /chat/id", () => {
	it("gets a project chat history as user", async () => {
		let resp = await request(app)
			.get(`/chat/${TEST_DATA.completedProject1.id}`)
			.send({ _token: TEST_DATA.userToken });
		expect(resp.statusCode).toBe(200);
		expect(resp.body.chat).toHaveLength(2);
		expect(resp.body.chat[0]).toHaveProperty("id");
	});

	it("gets a project chat history as tradesman", async () => {
		let resp = await request(app)
			.get(`/chat/${TEST_DATA.completedProject1.id}`)
			.send({ _token: TEST_DATA.tradesmanToken });
		expect(resp.statusCode).toBe(200);
		expect(resp.body.chat).toHaveLength(2);
		expect(resp.body.chat[0]).toHaveProperty("id");
	});

	it("returns an error if wrong user is logged in", async () => {
		let resp = await request(app)
			.get(`/chat/${TEST_DATA.completedProject1.id}`)
			.send({ _token: TEST_DATA.user2Token });
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});

	it("returns an error if wrong tradesman is logged in", async () => {
		let resp = await request(app)
			.get(`/chat/${TEST_DATA.completedProject1.id}`)
			.send({ _token: TEST_DATA.tradesman2Token });
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});

	it("returns an error if no one is logged in", async () => {
		let resp = await request(app).get(
			`/chat/${TEST_DATA.completedProject1.id}`
		);
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});
});

describe("PATCH /chat/id", () => {
	it("updates user chat based on id", async () => {
		let data = {
			_token: TEST_DATA.userToken,
			comment: "updated",
		};
		let resp = await request(app)
			.patch(`/chat/${TEST_DATA.userChat.id}`)
			.send(data);
		expect(resp.statusCode).toBe(200);
		expect(resp.body.chat.comment).toEqual(data.comment);
	});

	it("updates tradesman chat based on id", async () => {
		let data = {
			_token: TEST_DATA.tradesmanToken,
			comment: "updated",
		};
		let resp = await request(app)
			.patch(`/chat/${TEST_DATA.tradesmanChat.id}`)
			.send(data);
		expect(resp.statusCode).toBe(200);
		expect(resp.body.chat.comment).toEqual(data.comment);
	});

	it("returns an error if user tries to 'id' or 'project_id", async () => {
		let data = {
			_token: TEST_DATA.userToken,
			id: 9876,
			project_id: 98765,
		};
		let resp = await request(app)
			.patch(`/chat/${TEST_DATA.userChat.id}`)
			.send(data);
		expect(resp.statusCode).toBe(400);
		expect(resp.body.error.message).toEqual(
			"Not allowed to change 'ID' or 'project_ID'"
		);
	});

	it("returns an error for incorrect paramter type", async () => {
		let data = {
			_token: TEST_DATA.userToken,
			comment: 1,
		};
		let resp = await request(app)
			.patch(`/chat/${TEST_DATA.userChat.id}`)
			.send(data);
		expect(resp.statusCode).toBe(400);
		let errorMessage = ["instance.comment is not of a type(s) string"];
		expect(resp.body.error.message).toEqual(errorMessage);
	});

	it("returns an error if user tries to update tradesman comment", async () => {
		let data = {
			_token: TEST_DATA.userToken,
			comment: "updated",
		};
		let resp = await request(app)
			.patch(`/chat/${TEST_DATA.tradesmanChat.id}`)
			.send(data);
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});

	it("returns an error if tradesman tries to update user comment", async () => {
		let data = {
			_token: TEST_DATA.tradesmanToken,
			comment: "updated",
		};
		let resp = await request(app)
			.patch(`/chat/${TEST_DATA.userChat.id}`)
			.send(data);
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});

	it("returns an error if no one is logged in", async () => {
		let data = {
			_token: TEST_DATA.tradesmanToken,
			comment: "updated",
		};
		let resp = await request(app)
			.patch(`/chat/${TEST_DATA.userChat.id}`)
			.send(data);
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});
});

describe("DELETE /chat/id", () => {
	test("deletes the chat as user", async () => {
		let resp = await request(app)
			.delete(`/chat/${TEST_DATA.userChat.id}`)
			.send({ _token: TEST_DATA.userToken });
		expect(resp.statusCode).toBe(200);
		expect(resp.body.message).toEqual("Comment deleted");
	});

	test("deletes the chat as tradesman", async () => {
		let resp = await request(app)
			.delete(`/chat/${TEST_DATA.tradesmanChat.id}`)
			.send({ _token: TEST_DATA.tradesmanToken });
		expect(resp.statusCode).toBe(200);
		expect(resp.body.message).toEqual("Comment deleted");
	});

	test("returns an error if different user is logged in", async () => {
		let resp = await request(app)
			.delete(`/chat/${TEST_DATA.userChat.id}`)
			.send({ _token: TEST_DATA.user2Token });
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});

	test("returns an error if different tradesman is logged in", async () => {
		let resp = await request(app)
			.delete(`/chat/${TEST_DATA.userChat.id}`)
			.send({ _token: TEST_DATA.tradesman2Token });
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});

	test("returns an error if no one is logged in", async () => {
		let resp = await request(app).delete(`/chat/${TEST_DATA.userChat.id}`);
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
