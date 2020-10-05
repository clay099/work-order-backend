process.env.NODE_ENV = "test";
const Photo = require("../../models/photoModel");
console.error = jest.fn();

const {
	TEST_DATA,
	afterEachHook,
	afterAllHook,
	beforeAllHook,
	beforeEachHook,
} = require("../../testConfig");

describe("test Photo Model", () => {
	beforeAll(async function () {
		await beforeAllHook();
	});

	beforeEach(async function () {
		await beforeEachHook(TEST_DATA);
	});

	let random_num = (num = 100) => {
		return Math.floor(Math.random() * num);
	};

	describe("Photo.create()", () => {
		let photo;
		beforeEach(function () {
			photo = {
				project_id: `${TEST_DATA.completedProject1.id}`,
				photo_link: `url link goes here`,
				description: `description`,
				after: false,
				user_id: `${TEST_DATA.completedProject1.user_id}`,
			};
		});

		it("creates a new Photo", async () => {
			let resp = await Photo.create(photo);
			expect(resp).toHaveProperty("id");
			expect(Object.keys(resp)).toHaveLength(6);
		});

		it("returns destructure TypeError if no values are provided", async () => {
			try {
				await Photo.create();
			} catch (error) {
				expect(error.message).toEqual(
					`Cannot destructure property 'project_id' of 'undefined' as it is undefined.`
				);
			}
		});
	});

	describe("Photo.all()", () => {
		it("gets all photos", async () => {
			let resp = await Photo.all();
			expect(resp[0].id).toEqual(TEST_DATA.photo.id);
		});
	});

	describe("Photo.get()", () => {
		it("gets the one created photo by id", async () => {
			let resp = await Photo.get(TEST_DATA.photo.id);
			expect(resp).toHaveProperty("id");
			expect(Object.keys(resp)).toHaveLength(6);
		});

		it("returns an error if photo can't be found", async () => {
			try {
				await Photo.get(654321);
			} catch (error) {
				expect(error.message).toEqual(
					`Could not find photo id: 654321`
				);
			}
		});
	});

	describe("Photo.getAll()", () => {
		it("gets the photos by project_id", async () => {
			let resp = await Photo.getAll(TEST_DATA.completedProject1.id);
			expect(resp[0]).toHaveProperty("id");
			expect(resp).toHaveLength(1);
		});

		it("returns an error if no photos are found", async () => {
			try {
				let resp = await Photo.getAll(654321);
			} catch (error) {
				expect(error.message).toEqual(
					`Could not find Photos associated with Project id: 654321`
				);
			}
		});
	});

	describe("Photo.update()", () => {
		it("updates the one created photo", async () => {
			let photo = await Photo.get(TEST_DATA.photo.id);
			let updatedPhoto = await photo.update({
				description: "updated Description",
			});
			expect(updatedPhoto.description).toEqual("updated Description");
			expect(Object.keys(updatedPhoto)).toHaveLength(6);
		});

		it("returns an error if you try to add a photo property which does not exist", async () => {
			let photo = await Photo.get(TEST_DATA.photo.id);
			try {
				await photo.update({
					newcolumn: true,
				});
			} catch (error) {
				expect(error.message).toEqual(
					`column \"newcolumn\" of relation \"photos\" does not exist`
				);
			}
		});
	});

	describe("Photo.remove()", () => {
		it("deleted the created photo", async () => {
			let resp = await Photo.remove(TEST_DATA.photo.id);
			expect(resp).toEqual("deleted");
		});

		it("returns an error if photo can't be found", async () => {
			try {
				await Photo.remove(6543210);
			} catch (error) {
				expect(error.message).toEqual(
					`Could not find photo id: 6543210`
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
