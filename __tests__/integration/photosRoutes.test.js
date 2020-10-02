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

describe("GET /photos", () => {
	it("gets all photos", async () => {
		let resp = await request(app).get(`/photos`);
		expect(resp.statusCode).toBe(200);
		expect(resp.body.photos).toHaveLength(1);
	});
});

describe("POST /photos", () => {
	it("adds photo to project with logged in user", async () => {
		let data = {
			_token: TEST_DATA.userToken,
			project_id: TEST_DATA.completedProject1.id,
			photo_link: "photoLink",
			description: "photo description",
			after: true,
		};
		let resp = await request(app).post(`/photos`).send(data);
		expect(resp.statusCode).toBe(201);
		expect(resp.body.photo).toHaveProperty("id");
	});

	it("returns an error for each missing field", async () => {
		let data = {
			_token: TEST_DATA.userToken,
			project_id: TEST_DATA.completedProject1.id,
		};
		let resp = await request(app).post(`/photos`).send(data);
		expect(resp.statusCode).toBe(400);
		let errorMessage = [
			'instance requires property "photo_link"',
			'instance requires property "description"',
			'instance requires property "after"',
		];
		expect(resp.body.error.message).toEqual(errorMessage);
	});
	it("returns an error for incorrect paramter type", async () => {
		let data = {
			_token: TEST_DATA.userToken,
			project_id: TEST_DATA.completedProject1.id,
			photo_link: 1,
			description: 1,
			after: "true",
		};
		let resp = await request(app).post(`/photos`).send(data);
		expect(resp.statusCode).toBe(400);
		let errorMessage = [
			"instance.photo_link is not of a type(s) string",
			"instance.description is not of a type(s) string",
			"instance.after is not of a type(s) boolean",
		];
		expect(resp.body.error.message).toEqual(errorMessage);
	});

	it("returns an error if the tradesman tries to add a photo", async () => {
		let data = {
			_token: TEST_DATA.tradesmanToken,
			project_id: TEST_DATA.completedProject1.id,
			photo_link: "photoLink",
			description: "photo description",
			after: true,
		};
		let resp = await request(app).post(`/photos`).send(data);
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});

	it("returns an error if the user tries to add a photo for a project they are not involved with", async () => {
		let data = {
			_token: TEST_DATA.user2Token,
			project_id: TEST_DATA.completedProject1.id,
			photo_link: "photoLink",
			description: "photo description",
			after: true,
		};
		let resp = await request(app).post(`/photos`).send(data);
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});

	it("returns an error if no one is logged in", async () => {
		let data = {
			project_id: TEST_DATA.completedProject1.id,
			photo_link: "photoLink",
			description: "photo description",
			after: true,
		};
		let resp = await request(app).post(`/photos`).send(data);
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});
});

describe("GET /photos/id", () => {
	it("gets a photo based on photo id", async () => {
		let resp = await request(app)
			.get(`/photos/${TEST_DATA.photo.id}`)
			.send({ _token: TEST_DATA.userToken });
		expect(resp.statusCode).toBe(200);
		expect(resp.body.photo).toHaveProperty("project_id");
		expect(Object.keys(resp.body.photo)).toHaveLength(6);
	});

	it("returns an error when photo id can't be found", async () => {
		let resp = await request(app)
			.get(`/photos/987654`)
			.send({ _token: TEST_DATA.userToken });
		expect(resp.statusCode).toBe(404);
		expect(resp.body.error.message).toEqual(
			"Could not find photo id: 987654"
		);
	});

	it("returns an error when no one is logged in", async () => {
		let resp = await request(app).get(`/photos/${TEST_DATA.photo.id}`);
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});
});

describe("PATCH /photos/id", () => {
	it("updates photo based on id", async () => {
		let data = {
			_token: TEST_DATA.userToken,
			photo_link: "updatedLink",
		};
		let resp = await request(app)
			.patch(`/photos/${TEST_DATA.photo.id}`)
			.send(data);
		expect(resp.statusCode).toBe(200);
		expect(resp.body.photo.photo_link).toEqual(data.photo_link);
	});

	it("returns an error if user tries to update the photo id", async () => {
		let data = {
			_token: TEST_DATA.userToken,
			id: 100,
		};
		let resp = await request(app)
			.patch(`/photos/${TEST_DATA.photo.id}`)
			.send(data);
		expect(resp.statusCode).toBe(400);
		expect(resp.body.error.message).toEqual("Not allowed to change 'ID'");
	});

	it("returns an error if photos id can't be found", async () => {
		let data = {
			_token: TEST_DATA.userToken,
			photo_link: "updatedLink",
		};
		let resp = await request(app).patch(`/photos/1000`).send(data);
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});

	it("returns an error if the tradesman tries to update the photo", async () => {
		let data = {
			_token: TEST_DATA.tradesmanToken,
			photo_link: "updatedLink",
		};
		let resp = await request(app)
			.patch(`/photos/${TEST_DATA.photo.id}`)
			.send(data);
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});

	it("returns an error if the a different user tries to update the photo", async () => {
		let data = {
			_token: TEST_DATA.user2Token,
			photo_link: "updatedLink",
		};
		let resp = await request(app)
			.patch(`/photos/${TEST_DATA.photo.id}`)
			.send(data);
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});

	it("returns an error if no one is logged in", async () => {
		let data = {
			_token: TEST_DATA.user2Token,
			photo_link: "updatedLink",
		};
		let resp = await request(app)
			.patch(`/photos/${TEST_DATA.photo.id}`)
			.send(data);
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});
});

describe("DELETE /photos/id", () => {
	test("deletes the photo", async () => {
		let data = {
			_token: TEST_DATA.userToken,
			photo_link: "updatedLink",
		};
		let resp = await request(app)
			.delete(`/photos/${TEST_DATA.photo.id}`)
			.send(data);
		expect(resp.statusCode).toBe(200);
		expect(resp.body.message).toEqual("Photo deleted");
	});

	test("returns an error if tradesman is logged in", async () => {
		let data = {
			_token: TEST_DATA.tradesmanToken,
			photo_link: "updatedLink",
		};
		let resp = await request(app)
			.delete(`/photos/${TEST_DATA.photo.id}`)
			.send(data);
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});

	test("returns an error if different user is logged in", async () => {
		let data = {
			_token: TEST_DATA.user2Token,
			photo_link: "updatedLink",
		};
		let resp = await request(app)
			.delete(`/photos/${TEST_DATA.photo.id}`)
			.send(data);
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});

	test("returns an error if no one is logged in", async () => {
		let data = {
			photo_link: "updatedLink",
		};
		let resp = await request(app)
			.delete(`/photos/${TEST_DATA.photo.id}`)
			.send(data);
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
