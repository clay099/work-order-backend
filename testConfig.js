// npm packages
const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("./config");
const createToken = require("./helpers/createToken");

// app imports
const app = require("./app");
const db = require("./db");

// global auth variable to store things for all the tests
const TEST_DATA = {};

async function beforeAllHook() {
	try {
		await db.query(DB_TABLES["users"]);
		await db.query(DB_TABLES["tradesmen"]);
		await db.query(DB_TABLES["projects"]);
		await db.query(DB_TABLES["chat"]);
		await db.query(DB_TABLES["reviews"]);
		await db.query(DB_TABLES["photos"]);
	} catch (error) {
		console.error(error);
	}
}

/**
 * Hooks to insert a user, tradesman, and project, and to authenticate
 *  the user and the company for respective tokens that are stored
 *  in the input `testData` parameter.
 * @param {Object} TEST_DATA - build the TEST_DATA object
 */
async function beforeEachHook(TEST_DATA) {
	try {
		// login a user, get a token, store the user ID and token
		const hashedPassword = await bcrypt.hash("secret", BCRYPT_WORK_FACTOR);
		const user = await db.query(
			`INSERT INTO users (first_name, last_name, email, phone, street_address, address_city, address_zip, address_country, password)
      VALUES ('userFirstName', 'userLastName', 'testUser@gmail.com', 1234567890, '1 Sacramento Street', 'Sacramento', 98756, 'USA', $1) 
      RETURNING *`,
			[hashedPassword]
		);

		TEST_DATA.user = user.rows[0];

		const userToken = createToken(
			TEST_DATA.user.email,
			TEST_DATA.user.id,
			"user"
		);

		TEST_DATA.userToken = userToken;

		// add a second user who won't be linked to any projects
		const user2 = await db.query(
			`INSERT INTO users (first_name, last_name, email, phone, street_address, address_city, address_zip, address_country, password)
      VALUES ('user2FirstName', 'user2LastName', 'testUser2@gmail.com', 2345678901, '1 Sacramento Street', 'Sacramento', 98756, 'USA', $1) 
      RETURNING *`,
			[hashedPassword]
		);

		TEST_DATA.user2 = user2.rows[0];

		const user2Token = createToken(
			TEST_DATA.user2.email,
			TEST_DATA.user2.id,
			"user"
		);
		TEST_DATA.user2Token = user2Token;

		// do the same for tradesman
		const tradesman = await db.query(
			"INSERT INTO tradesmen (first_name, last_name, email, phone, password) VALUES ('tradesmanFirstName', 'tradesmanLastName', 'testTradesman@gmail.com', 0987654321, $1) RETURNING *",
			[hashedPassword]
		);

		TEST_DATA.tradesman = tradesman.rows[0];

		const tradesmanToken = createToken(
			TEST_DATA.tradesman.email,
			TEST_DATA.tradesman.id,
			"tradesman"
		);

		TEST_DATA.tradesmanToken = tradesmanToken;

		// second tradesman who won't be linked to any projects
		const tradesman2 = await db.query(
			"INSERT INTO tradesmen (first_name, last_name, email, phone, password) VALUES ('tradesman2FirstName', 'tradesman2LastName', 'testTradesman2@gmail.com', 9876543210, $1) RETURNING *",
			[hashedPassword]
		);

		TEST_DATA.tradesman2 = tradesman2.rows[0];

		const tradesman2Token = createToken(
			TEST_DATA.tradesman2.email,
			TEST_DATA.tradesman2.id,
			"tradesman"
		);

		TEST_DATA.tradesman2Token = tradesman2Token;

		// add a new project
		const newProject = await db.query(
			"INSERT INTO projects (user_id, description, street_address, address_city, address_zip, address_country) VALUES ($1, 'paint kitchen', '1 Sacramento Street', 'Sacramento', 98756, 'USA') RETURNING *",
			[TEST_DATA.user.id]
		);
		TEST_DATA.newProject = newProject.rows[0];

		// add a completed project - comments to be added to this project
		const completedProject1 = await db.query(
			"INSERT INTO projects (user_id, description, street_address, address_city, address_zip, address_country, price, tradesmen_id, status, completed_at, issues) VALUES ($1, 'paint kitchen', '1 Sacramento Street', 'Sacramento', 98756, 'USA', 500, $2, 'completed', current_timestamp, 'paint different color') RETURNING *",
			[TEST_DATA.user.id, TEST_DATA.tradesman.id]
		);

		TEST_DATA.completedProject1 = completedProject1.rows[0];

		// add a completed project which will have no third party attachments past user_id & tradesman_id
		const completedProject2 = await db.query(
			"INSERT INTO projects (user_id, description, street_address, address_city, address_zip, address_country, price, tradesmen_id, status, completed_at) VALUES ($1, 'Fix kitchen sink', '1 Sacramento Street', 'Sacramento', 98756, 'USA', 500, $2, 'completed', current_timestamp) RETURNING *",
			[TEST_DATA.user.id, TEST_DATA.tradesman.id]
		);

		TEST_DATA.completedProject2 = completedProject2.rows[0];

		// add chat for completedProject1 (from user)
		const userChat = await db.query(
			`INSERT INTO chat (project_id, user_id, comment) VALUES ($1, $2, 'thank you for your work') RETURNING *`,
			[TEST_DATA.completedProject1.id, TEST_DATA.user.id]
		);
		TEST_DATA.userChat = userChat.rows[0];

		// add chat for CompletedProject1 (from tradesman)
		const tradesmanChat = await db.query(
			`INSERT INTO chat (project_id, tradesmen_id, comment) VALUES ($1, $2, 'let me know if there is anything else i can do') RETURNING *`,
			[TEST_DATA.completedProject1.id, TEST_DATA.tradesman.id]
		);
		TEST_DATA.tradesmanChat = tradesmanChat.rows[0];

		// add review for completedProject1
		await db.query(
			`INSERT INTO reviews (user_id, tradesmen_id, project_id, review_comment, review_rating) VALUES ($1, $2, $3, 'quick to do project, color is a little off', 9)`,
			[
				TEST_DATA.user.id,
				TEST_DATA.tradesman.id,
				TEST_DATA.completedProject1.id,
			]
		);

		// add photos for completedProject1
		const photo = await db.query(
			`INSERT INTO photos (project_id, photo_link, description, after, user_id) VALUES 
      ($1, 'before photo link', 'kitchen before', false, $2) RETURNING *`,
			[
				TEST_DATA.completedProject1.id,
				TEST_DATA.completedProject1.user_id,
			]
		);
		TEST_DATA.photo = photo.rows[0];
	} catch (error) {
		console.error(error);
	}
}

async function afterEachHook() {
	try {
		await db.query("DELETE FROM users");
		await db.query("DELETE FROM tradesmen");
		await db.query("DELETE FROM projects");
		await db.query("DELETE FROM chat");
		await db.query("DELETE FROM reviews");
		await db.query("DELETE FROM photos");
	} catch (error) {
		console.error(error);
	}
}

async function afterAllHook() {
	try {
		await db.end();
	} catch (err) {
		console.error(err);
	}
}
test.skip("skip", () => {});

module.exports = {
	afterAllHook,
	afterEachHook,
	TEST_DATA,
	beforeAllHook,
	beforeEachHook,
};
