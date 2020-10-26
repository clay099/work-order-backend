process.env.NODE_ENV = "test";
const Tradesman = require("../../models/tradesmanModel");
console.error = jest.fn();

const {
	TEST_DATA,
	afterEachHook,
	afterAllHook,
	beforeAllHook,
	beforeEachHook,
} = require("../../testConfig");

describe("test Tradesman Model", () => {
	beforeAll(async function () {
		await beforeAllHook();
	});

	beforeEach(async function () {
		await beforeEachHook(TEST_DATA);
	});

	let random_num = (num = 100) => {
		return Math.floor(Math.random() * num);
	};

	describe("Tradesman.create()", () => {
		let tradesman;
		beforeEach(function () {
			let num = random_num();
			tradesman = {
				first_name: `tradesman${num}First`,
				last_name: `tradesman${num}Last`,
				email: `tradesman${num}@gmail.com`,
				phone: random_num(10000000000),
				password: "secret",
			};
		});

		it("creates a new tradesman", async () => {
			let resp = await Tradesman.create(tradesman);
			expect(resp).toHaveProperty("id");
			expect(Object.keys(resp)).toHaveLength(8);
		});

		it("returns destructure TypeError if no values are provided", async () => {
			try {
				await Tradesman.create();
			} catch (error) {
				expect(error.message).toEqual(
					`Cannot destructure property 'first_name' of 'undefined' as it is undefined.`
				);
			}
		});
		it("returns errors if no password is provided (due to bcrypt)", async () => {
			delete tradesman.password;
			try {
				await Tradesman.create(tradesman);
			} catch (error) {
				expect(error.message).toEqual(
					`data and salt arguments required`
				);
			}
		});
	});

	describe("Tradesman.all()", () => {
		it("gets all tradesman", async () => {
			let resp = await Tradesman.all();
			expect(resp[0].first_name).toEqual(TEST_DATA.tradesman2.first_name);
		});
	});

	describe("Tradesman.get()", () => {
		it("gets the one created tradesman by id", async () => {
			let resp = await Tradesman.get(TEST_DATA.tradesman.id);
			expect(resp.password).toEqual(undefined);
			expect(resp.first_name).toEqual(TEST_DATA.tradesman.first_name);
		});

		it("returns an error if tradesman can't be found", async () => {
			try {
				await Tradesman.get(654321);
			} catch (error) {
				expect(error.message).toEqual(
					`Could not find tradesman id: 654321`
				);
			}
		});
	});

	describe("Tradesman.getAll()", () => {
		it("gets the one created tradesman by email with all details", async () => {
			let resp = await Tradesman.getAll(TEST_DATA.tradesman.email);
			expect(resp.password).toEqual(TEST_DATA.tradesman.password);
			expect(resp.first_name).toEqual(TEST_DATA.tradesman.first_name);
		});

		it("returns an error if tradesman can't be found", async () => {
			try {
				await Tradesman.getAll("fake@gmail.com");
			} catch (error) {
				expect(error.message).toEqual(
					`Could not find tradesman email: fake@gmail.com`
				);
			}
		});
	});

	describe("Tradesman.update()", () => {
		it("updates the one created tradesman", async () => {
			let tradesman = await Tradesman.getAll(TEST_DATA.tradesman.email);
			let updatedTradesman = await tradesman.update({
				first_name: "updatedFirstName",
			});
			expect(updatedTradesman.first_name).toEqual("updatedFirstName");
			expect(Object.keys(updatedTradesman)).toHaveLength(7);
		});

		it("returns an error if you try to add a tradesman property which does not exist", async () => {
			let tradesman = await Tradesman.getAll(TEST_DATA.tradesman.email);
			try {
				await tradesman.update({
					admin: true,
				});
			} catch (error) {
				expect(error.message).toEqual(
					`column \"admin\" of relation \"tradesmen\" does not exist`
				);
			}
		});
	});

	describe("Tradesman.remove()", () => {
		it("deleted the created tradesman", async () => {
			let resp = await Tradesman.remove(TEST_DATA.tradesman.id);
			expect(resp).toEqual("deleted");
		});

		it("returns an error if tradesman can't be found", async () => {
			try {
				await Tradesman.remove(6543210);
			} catch (error) {
				expect(error.message).toEqual(
					`Could not find tradesman id: 6543210`
				);
			}
		});
	});

	describe("Tradesman.authenticate()", () => {
		it("authenticates the tradesman", async () => {
			let tradesman = await Tradesman.getAll(TEST_DATA.tradesman.email);
			let token = await tradesman.authenticate("secret");
			expect(token).toEqual(expect.any(String));
		});

		it("returns an error if password can't be authenticated", async () => {
			try {
				let tradesman = await Tradesman.getAll(
					TEST_DATA.tradesman.email
				);
				await tradesman.authenticate("wrongPW");
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
