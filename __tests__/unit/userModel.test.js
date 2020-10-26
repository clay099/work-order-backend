process.env.NODE_ENV = "test";
const User = require("../../models/userModel");
console.error = jest.fn();

const {
	TEST_DATA,
	afterEachHook,
	afterAllHook,
	beforeAllHook,
	beforeEachHook,
} = require("../../testConfig");

describe("test User Model", () => {
	beforeAll(async function () {
		await beforeAllHook();
	});

	beforeEach(async function () {
		await beforeEachHook(TEST_DATA);
	});

	let random_num = (num = 100) => {
		return Math.floor(Math.random() * num);
	};

	describe("User.create()", () => {
		let user;
		beforeEach(function () {
			let num = random_num();
			user = {
				first_name: `user${num}First`,
				last_name: `user${num}Last`,
				email: `user${num}@gmail.com`,
				phone: random_num(10000000000),
				street_address: "2 Sacramento Street",
				address_city: "Sacraemento",
				address_zip: 745896,
				address_country: "USA",
				password: "secret",
			};
		});

		it("creates a new user", async () => {
			let resp = await User.create(user);
			expect(resp).toHaveProperty("id");
			expect(Object.keys(resp)).toHaveLength(10);
		});

		it("returns destructure TypeError if no values are provided", async () => {
			try {
				await User.create();
			} catch (error) {
				expect(error.message).toEqual(
					`Cannot destructure property 'first_name' of 'undefined' as it is undefined.`
				);
			}
		});
		it("returns errors if no password is provided (due to bcrypt)", async () => {
			delete user.password;
			try {
				await User.create(user);
			} catch (error) {
				expect(error.message).toEqual(
					`data and salt arguments required`
				);
			}
		});
	});

	describe("User.all()", () => {
		it("gets all users", async () => {
			let resp = await User.all();
			expect(resp[0].first_name).toEqual(TEST_DATA.user2.first_name);
		});
	});

	describe("User.get()", () => {
		it("gets the one created user by id", async () => {
			let resp = await User.get(TEST_DATA.user.id);
			expect(resp).not.toHaveProperty("password");
			expect(Object.keys(resp)).toHaveLength(9);
		});

		it("returns an error if user can't be found", async () => {
			try {
				await User.get(654321);
			} catch (error) {
				expect(error.message).toEqual(`Could not find User id: 654321`);
			}
		});
	});

	describe("User.getAll()", () => {
		it("gets the one created user by email with all details", async () => {
			let resp = await User.getAll(TEST_DATA.user.email);
			expect(resp).toHaveProperty("password");
			expect(Object.keys(resp)).toHaveLength(10);
		});

		it("returns an error if user can't be found", async () => {
			try {
				await User.getAll("fake@gmail.com");
			} catch (error) {
				expect(error.message).toEqual(
					`Could not find User email: fake@gmail.com`
				);
			}
		});
	});

	describe("User.update()", () => {
		it("updates the one created user", async () => {
			let user = await User.getAll(TEST_DATA.user.email);
			let updatedUser = await user.update({
				first_name: "updatedFirstName",
			});
			expect(updatedUser.first_name).toEqual("updatedFirstName");
			expect(Object.keys(updatedUser)).toHaveLength(9);
		});

		it("returns an error if you try to add a user property which does not exist", async () => {
			let user = await User.getAll(TEST_DATA.user.email);
			try {
				await user.update({
					admin: true,
				});
			} catch (error) {
				expect(error.message).toEqual(
					`column \"admin\" of relation \"users\" does not exist`
				);
			}
		});
	});

	describe("User.remove()", () => {
		it("deleted the created user", async () => {
			let resp = await User.remove(TEST_DATA.user.id);
			expect(resp).toEqual("deleted");
		});

		it("returns an error if user can't be found", async () => {
			try {
				await User.remove(6543210);
			} catch (error) {
				expect(error.message).toEqual(
					`Could not find user id: 6543210`
				);
			}
		});
	});

	describe("User.authenticate()", () => {
		it("authenticates the user", async () => {
			let user = await User.getAll(TEST_DATA.user.email);
			let token = await user.authenticate("secret");
			expect(token).toEqual(expect.any(String));
		});

		it("returns an error if password can't be authenticated", async () => {
			try {
				let user = await User.getAll(TEST_DATA.user.email);
				await user.authenticate("wrongPW");
			} catch (error) {
				expect(error.message).toEqual(`Invalid email/password`);
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
