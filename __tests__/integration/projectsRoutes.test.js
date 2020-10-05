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

describe("GET /projects", () => {
	it("gets a array of all projects a user is associated with", async () => {
		const resp = await request(app)
			.get("/projects")
			.send({ _token: TEST_DATA.userToken });
		expect(resp.statusCode).toBe(200);
		expect(resp.body.projects[0].description).toEqual("Fix kitchen sink");
		expect(resp.body.projects[1].description).toEqual("paint house");
		expect(resp.body.projects[2].description).toEqual("paint kitchen");
		expect(resp.body.projects).toHaveLength(3);
	});

	it("gets a array of all projects a tradesman is associated with", async () => {
		const resp = await request(app)
			.get("/projects")
			.send({ _token: TEST_DATA.tradesmanToken });
		expect(resp.statusCode).toBe(200);
		expect(resp.body.projects[0].description).toEqual("Fix kitchen sink");
		expect(resp.body.projects[1].description).toEqual("paint house");
		expect(resp.body.projects).toHaveLength(2);
	});

	it("gets a empty array if the user has no projects", async () => {
		const resp = await request(app)
			.get("/projects")
			.send({ _token: TEST_DATA.user2Token });
		expect(resp.statusCode).toBe(200);
		expect(resp.body.projects).toHaveLength(0);
	});

	it("gets a empty array if the tradesman has no projects", async () => {
		const resp = await request(app)
			.get("/projects")
			.send({ _token: TEST_DATA.tradesman2Token });
		expect(resp.statusCode).toBe(200);
		expect(resp.body.projects).toHaveLength(0);
	});

	it("returns an error if no one is logged in", async () => {
		const resp = await request(app).get("/projects");
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});
});

describe("GET /projects/new", () => {
	it(`gets projects which are at the 'auction' status`, async () => {
		const resp = await request(app)
			.get("/projects/new")
			.send({ _token: TEST_DATA.tradesmanToken });
		expect(resp.statusCode).toBe(200);
		expect(resp.body.projects[0].description).toEqual("paint kitchen");
		expect(resp.body.projects).toHaveLength(1);
	});

	it(`returns an error if user tries to see new projects`, async () => {
		const resp = await request(app)
			.get("/projects/new")
			.send({ _token: TEST_DATA.userToken });
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});

	it(`returns an error if no one is logged in`, async () => {
		const resp = await request(app).get("/projects/new");
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});
});

describe("POST /projects", () => {
	it("creates a new project", async () => {
		let project = {
			description: "fix kitchen sink",
			street_address: "1 Sacramento Street",
			address_city: "San Francisco",
			address_zip: 94687,
			address_country: "United States of America",
		};
		const resp = await request(app)
			.post(`/projects`)
			.send({ _token: TEST_DATA.userToken, ...project });
		expect(resp.statusCode).toBe(201);
		expect(resp.body.project.description).toEqual(project.description);
		expect(resp.body.project).toHaveProperty(`id`);
		expect(resp.body.project).toHaveProperty(`user_id`);
	});

	it("returns an error if the user tries to create the same project twice", async () => {
		let project = {
			description: "fix kitchen sink",
			street_address: "1 Sacramento Street",
			address_city: "San Francisco",
			address_zip: 94687,
			address_country: "United States of America",
		};
		// create project
		await request(app)
			.post(`/projects`)
			.send({ _token: TEST_DATA.userToken, ...project });
		// add same project for second time
		const resp = await request(app)
			.post(`/projects`)
			.send({ _token: TEST_DATA.userToken, ...project });
		expect(resp.statusCode).toBe(400);
		expect(resp.body.error.message).toContain(
			"project 'fix kitchen sink' already created under project id"
		);
	});

	it("returns an error for each missing field", async () => {
		const resp = await request(app)
			.post(`/projects`)
			.send({ _token: TEST_DATA.userToken });
		expect(resp.statusCode).toBe(400);
		let errorMessage = [
			'instance requires property "description"',
			'instance requires property "street_address"',
			'instance requires property "address_city"',
			'instance requires property "address_zip"',
			'instance requires property "address_country"',
		];
		expect(resp.body.error.message).toEqual(errorMessage);
	});

	it("returns an error for incorrect paramter type", async () => {
		let project = {
			description: 1,
			street_address: 1,
			address_city: 1,
			address_zip: "94687",
			address_country: 1,
		};
		const resp = await request(app)
			.post(`/projects`)
			.send({ _token: TEST_DATA.userToken, ...project });
		expect(resp.statusCode).toBe(400);

		let errorMessage = [
			"instance.description is not of a type(s) string",
			"instance.street_address is not of a type(s) string",
			"instance.address_city is not of a type(s) string",
			"instance.address_zip is not of a type(s) integer",
			"instance.address_country is not of a type(s) string",
		];
		expect(resp.body.error.message).toEqual(errorMessage);
	});

	it("returns an error if tradesman tries to create a project", async () => {
		let project = {
			description: "fix kitchen sink",
			street_address: "1 Sacramento Street",
			address_city: "San Francisco",
			address_zip: 94687,
			address_country: "United States of America",
		};
		const resp = await request(app)
			.post(`/projects`)
			.send({ _token: TEST_DATA.tradesmanToken, ...project });
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual(`Unauthorized`);
	});

	it("returns an error no one is logged in", async () => {
		let project = {
			description: "fix kitchen sink",
			street_address: "1 Sacramento Street",
			address_city: "San Francisco",
			address_zip: 94687,
			address_country: "United States of America",
		};
		const resp = await request(app).post(`/projects`).send(project);
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual(`Unauthorized`);
	});
});

describe("GET /projects/id", () => {
	it("gets one project where user is involved", async () => {
		const resp = await request(app)
			.get(`/projects/${TEST_DATA.completedProject1.id}`)
			.send({ _token: TEST_DATA.userToken });
		expect(resp.statusCode).toBe(200);
		expect(resp.body.project.description).toEqual(
			TEST_DATA.completedProject1.description
		);
	});

	it("gets one project where tradesman is involved", async () => {
		const resp = await request(app)
			.get(`/projects/${TEST_DATA.completedProject1.id}`)
			.send({ _token: TEST_DATA.tradesmanToken });
		expect(resp.statusCode).toBe(200);
		expect(resp.body.project.description).toEqual(
			TEST_DATA.completedProject1.description
		);
	});

	it("returns an error is user is not involved", async () => {
		const resp = await request(app)
			.get(`/projects/${TEST_DATA.completedProject1.id}`)
			.send({ _token: TEST_DATA.user2Token });
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});

	it("returns an error is tradesman is not involved", async () => {
		const resp = await request(app)
			.get(`/projects/${TEST_DATA.completedProject1.id}`)
			.send({ _token: TEST_DATA.tradesman2Token });
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});

	it("returns an error when no one is logged in", async () => {
		const resp = await request(app).get(
			`/projects/${TEST_DATA.completedProject1.id}`
		);
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});
});

describe("PATCH /project/id", () => {
	it("updates a project where user is involved", async () => {
		let updateData = {
			_token: TEST_DATA.userToken,
			description: "updated",
		};
		const resp = await request(app)
			.patch(`/projects/${TEST_DATA.completedProject1.id}`)
			.send(updateData);
		expect(resp.statusCode).toBe(200);
		TEST_DATA.completedProject1.description = updateData.description;
		expect(resp.body.project.description).toEqual(
			TEST_DATA.completedProject1.description
		);
		expect(resp.body.project).toHaveProperty("street_address");
	});

	it("updates a project where tradesman is involved", async () => {
		let updateData = {
			_token: TEST_DATA.tradesmanToken,
			description: "updated",
		};
		const resp = await request(app)
			.patch(`/projects/${TEST_DATA.completedProject1.id}`)
			.send(updateData);
		expect(resp.statusCode).toBe(200);
		TEST_DATA.completedProject1.description = updateData.description;
		expect(resp.body.project.description).toEqual(
			TEST_DATA.completedProject1.description
		);
		expect(resp.body.project).toHaveProperty("street_address");
	});

	it("returns an error if user is not involved", async () => {
		let updateData = {
			_token: TEST_DATA.user2Token,
			description: "updated",
		};
		const resp = await request(app)
			.patch(`/projects/${TEST_DATA.completedProject1.id}`)
			.send(updateData);
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});

	it("returns an error if tradesman is not involved", async () => {
		let updateData = {
			_token: TEST_DATA.tradesman2Token,
			description: "updated",
		};
		const resp = await request(app)
			.patch(`/projects/${TEST_DATA.completedProject1.id}`)
			.send(updateData);
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});

	it("returns an error for incorrect paramter type", async () => {
		let updateData = {
			_token: TEST_DATA.userToken,
			description: 1,
			street_address: 1,
			address_city: 1,
			address_zip: "94687",
			address_country: 1,
		};
		const resp = await request(app)
			.patch(`/projects/${TEST_DATA.completedProject1.id}`)
			.send(updateData);
		expect(resp.statusCode).toBe(400);

		let errorMessage = [
			"instance.description is not of a type(s) string",
			"instance.street_address is not of a type(s) string",
			"instance.address_city is not of a type(s) string",
			"instance.address_zip is not of a type(s) integer",
			"instance.address_country is not of a type(s) string",
		];
		expect(resp.body.error.message).toEqual(errorMessage);
	});

	it("returns an error if you try to update the project id", async () => {
		let updateData = {
			_token: TEST_DATA.userToken,
			id: 1000,
		};
		const resp = await request(app)
			.patch(`/projects/${TEST_DATA.completedProject1.id}`)
			.send(updateData);
		expect(resp.statusCode).toBe(400);
		expect(resp.body.error.message).toEqual(`Not allowed to change 'ID'`);
	});
});

describe("DELETE /projects/id", () => {
	it("deletes a project as a involved user", async () => {
		const resp = await request(app)
			.delete(`/projects/${TEST_DATA.completedProject1.id}`)
			.send({ _token: TEST_DATA.userToken });
		expect(resp.statusCode).toBe(200);
		expect(resp.body.message).toEqual("Project deleted");
	});

	it("deletes a project as a involved tradesman", async () => {
		const resp = await request(app)
			.delete(`/projects/${TEST_DATA.completedProject1.id}`)
			.send({ _token: TEST_DATA.tradesmanToken });
		expect(resp.statusCode).toBe(200);
		expect(resp.body.message).toEqual("Project deleted");
	});

	it("returns an error if user is not involved", async () => {
		const resp = await request(app)
			.delete(`/projects/${TEST_DATA.completedProject1.id}`)
			.send({ _token: TEST_DATA.user2Token });
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});

	it("returns an error if tradesman is not involved", async () => {
		const resp = await request(app)
			.delete(`/projects/${TEST_DATA.completedProject1.id}`)
			.send({ _token: TEST_DATA.tradesman2Token });
		expect(resp.statusCode).toBe(401);
		expect(resp.body.error.message).toEqual("Unauthorized");
	});

	it("returns an error if no one is logged in", async () => {
		const resp = await request(app).delete(
			`/projects/${TEST_DATA.completedProject1.id}`
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
