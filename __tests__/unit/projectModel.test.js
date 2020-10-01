process.env.NODE_ENV = "test";
const db = require("../../db");
const app = require("../../app");
const Project = require("../../models/projectModel");
console.error = jest.fn();

const {
	TEST_DATA,
	afterEachHook,
	afterAllHook,
	beforeAllHook,
	beforeEachHook,
} = require("./config");

describe("test Project Model", () => {
	beforeAll(async function () {
		await beforeAllHook();
	});

	beforeEach(async function () {
		await beforeEachHook(TEST_DATA);
	});

	let random_num = (num = 100) => {
		return Math.floor(Math.random() * num);
	};

	describe("Project.create()", () => {
		let project;
		beforeEach(function () {
			let num = random_num();
			project = {
				user_id: `${TEST_DATA.user.id}`,
				description: `test description ${num}`,
				street_address: `${TEST_DATA.user.street_address}`,
				address_city: `${TEST_DATA.user.address_city}`,
				address_zip: `${TEST_DATA.user.address_zip}`,
				address_country: `${TEST_DATA.user.address_country}`,
			};
		});

		it("creates a new project", async () => {
			let resp = await Project.create(project);
			expect(resp).toHaveProperty("id");
			expect(Object.keys(resp)).toHaveLength(13);
		});

		it("returns destructure TypeError if no values are provided", async () => {
			try {
				await Project.create();
			} catch (error) {
				expect(error.message).toEqual(
					`Cannot destructure property 'user_id' of 'undefined' as it is undefined.`
				);
			}
		});
	});

	describe("Project.all()", () => {
		it("gets all project", async () => {
			let resp = await Project.all();
			expect(resp).toHaveLength(3);
			expect(resp[0]).toHaveProperty("id");
		});
	});

	describe("Project.allUser()", () => {
		it("gets all projects the user is involved with", async () => {
			let resp = await Project.allUser(TEST_DATA.user.id);
			expect(resp).toHaveLength(3);
			expect(resp[0]).toHaveProperty("id");
			expect(resp[0]).not.toHaveProperty("issues");
			expect(resp[1]).toHaveProperty("issues");
			expect(resp[2]).not.toHaveProperty("issues");
		});
	});

	describe("Project.allTradesman()", () => {
		it("gets all projects the tradesman is involved with", async () => {
			let resp = await Project.allTradesman(TEST_DATA.tradesman.id);
			expect(resp).toHaveLength(2);
			expect(resp[0]).toHaveProperty("id");
			expect(resp[0]).not.toHaveProperty("issues");
			expect(resp[1]).toHaveProperty("issues");
		});
	});

	describe("Project.newProject()", () => {
		it("gets new jobs a tradesman can still apply for", async () => {
			let resp = await Project.newProject();
			expect(resp).toHaveLength(1);
			expect(resp[0].status).toEqual("auction");
			expect(resp[0]).not.toHaveProperty("street_address");
		});
	});

	describe("Project.get()", () => {
		it("gets project by id with logged in user", async () => {
			let user = {
				user_type: "user",
				id: TEST_DATA.completedProject1.user_id,
			};
			let resp = await Project.get(TEST_DATA.completedProject1.id, user);
			expect(resp.address_city).toEqual("Sacramento");
			expect(Object.keys(resp)).toHaveLength(13);
		});

		it("gets project by id with logged in tradesman", async () => {
			let user = {
				user_type: "tradesman",
				id: TEST_DATA.completedProject1.tradesmen_id,
			};
			let resp = await Project.get(TEST_DATA.completedProject1.id, user);
			expect(resp.address_city).toEqual("Sacramento");
			expect(Object.keys(resp)).toHaveLength(13);
		});

		it("returns an error if project can't be found", async () => {
			try {
				await Project.get(654321);
			} catch (error) {
				expect(error.message).toEqual(
					`Could not find Project id: 654321`
				);
			}
		});

		it("returns Unauthorized if not linked to project", async () => {
			let user = {
				user_type: "user",
				id: TEST_DATA.user2.id,
			};
			try {
				await Project.get(TEST_DATA.completedProject1.id, user);
			} catch (error) {
				expect(error.message).toEqual(`Unauthorized`);
				expect(error.status).toEqual(401);
			}
		});
	});

	describe("Project.update()", () => {
		it("updates the created project", async () => {
			let user = {
				user_type: "user",
				id: TEST_DATA.completedProject1.user_id,
			};
			let project = await Project.get(
				TEST_DATA.completedProject1.id,
				user
			);
			let updatedProject = await project.update({
				address_city: "UpdatedCity",
			});
			expect(updatedProject.address_city).toEqual("UpdatedCity");
			expect(Object.keys(updatedProject)).toHaveLength(13);
		});

		it("returns an error if you try to add a project property which does not exist", async () => {
			let user = {
				user_type: "user",
				id: TEST_DATA.completedProject1.user_id,
			};
			let project = await Project.get(
				TEST_DATA.completedProject1.id,
				user
			);
			try {
				await project.update({
					newcolumn: true,
				});
			} catch (error) {
				expect(error.message).toEqual(
					`column \"newcolumn\" of relation \"projects\" does not exist`
				);
			}
		});
	});

	describe("Project.remove()", () => {
		it("deleted the created project", async () => {
			let resp = await Project.remove(TEST_DATA.completedProject1.id);
			expect(resp).toEqual("deleted");
		});

		it("returns an error if project can't be found", async () => {
			try {
				await Project.remove(6543210);
			} catch (error) {
				expect(error.message).toEqual(
					`Could not find project id: 6543210`
				);
			}
		});
	});

	afterEach(async function () {
		await afterEachHook();
	});

	afterAll(async function () {
		await afterAllHook();
	});
});
