process.env.NODE_ENV = "test";
const Review = require("../../models/reviewModel");
console.error = jest.fn();

const {
	TEST_DATA,
	afterEachHook,
	afterAllHook,
	beforeAllHook,
	beforeEachHook,
} = require("../../testConfig");

describe("test Review Model", () => {
	beforeAll(async function () {
		await beforeAllHook();
	});

	beforeEach(async function () {
		await beforeEachHook(TEST_DATA);
	});

	let random_num = (num = 100) => {
		return Math.floor(Math.random() * num);
	};

	describe("Review.create()", () => {
		let review;
		beforeEach(async function () {
			let num = random_num();
			// create new project as project can only have one review
			let resp = await db.query(
				"INSERT INTO projects (user_id, description, street_address, address_city, address_zip, address_country, price, tradesmen_id, status, completed_at, issues) VALUES ($1, $2, '1 Sacramento Street', 'Sacramento', 98756, 'USA', 500, $3, 'completed', current_timestamp, 'paint different color') RETURNING *",
				[TEST_DATA.user.id, `new Project${num}`, TEST_DATA.tradesman.id]
			);
			let completedProject = resp.rows[0];
			review = {
				user_id: `${completedProject.user_id}`,
				tradesmen_id: `${completedProject.tradesmen_id}`,
				project_id: `${completedProject.id}`,
				review_comment: `good job`,
				review_rating: 9,
			};
		});

		it("creates a new review", async () => {
			let resp = await Review.create(review);
			expect(resp).toHaveProperty("review_comment");
			expect(Object.keys(resp)).toHaveLength(5);
		});

		it("returns destructure TypeError if no values are provided", async () => {
			try {
				await Review.create();
			} catch (error) {
				expect(error.message).toEqual(
					`Cannot destructure property 'user_id' of 'undefined' as it is undefined.`
				);
			}
		});
	});

	describe("Review.all()", () => {
		it("gets all review", async () => {
			let resp = await Review.all();
			expect(resp).toHaveLength(1);
			expect(resp[0]).toHaveProperty("review_comment");
		});
	});

	describe("Review.allUser()", () => {
		it("gets all reviews the user is involved with", async () => {
			let resp = await Review.all();
			expect(resp).toHaveLength(1);
		});
	});

	describe("Review.get()", () => {
		it("gets review by id", async () => {
			let resp = await Review.get(TEST_DATA.completedProject1.id);
			expect(resp.review_comment).toEqual(
				"quick to do project, color is a little off"
			);
			expect(Object.keys(resp)).toHaveLength(5);
		});

		it("returns an error if review can't be found", async () => {
			try {
				await Review.get(654321);
			} catch (error) {
				expect(error.message).toEqual(
					`Could not find review for project id: 654321`
				);
			}
		});
	});

	describe("Review.update()", () => {
		it("updates the created review", async () => {
			let review = await Review.get(TEST_DATA.completedProject1.id);
			let updatedReview = await review.update({
				review_comment: "Updated Review",
			});
			expect(updatedReview.review_comment).toEqual("Updated Review");
			expect(Object.keys(updatedReview)).toHaveLength(5);
		});

		it("returns an error if you try to add a review property which does not exist", async () => {
			let review = await Review.get(TEST_DATA.completedProject1.id);
			try {
				await review.update({
					newcolumn: true,
				});
			} catch (error) {
				expect(error.message).toEqual(
					`column \"newcolumn\" of relation \"reviews\" does not exist`
				);
			}
		});
	});

	describe("Review.remove()", () => {
		it("deleted the created review", async () => {
			let resp = await Review.remove(TEST_DATA.completedProject1.id);
			expect(resp).toEqual("deleted");
		});

		it("returns an error if review can't be found", async () => {
			try {
				await Review.remove(6543210);
			} catch (error) {
				expect(error.message).toEqual(
					`Could not find review project id: 6543210`
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
