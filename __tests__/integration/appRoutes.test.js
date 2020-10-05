/**
 * TEST FILE IS JUST TO TEST THE 404 HANDLER
 */
process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../../app");
// removes console.error & console.log from appearing in terminal
console.error = jest.fn();
console.log = jest.fn();

const { afterAllHook } = require("../../testConfig");

describe("GET 404 /get/fake/url/link", () => {
	it("will return 404 error if url is not found", async () => {
		let resp = await request(app).get("/get/fake/url/link");
		expect(resp.statusCode).toBe(404);
		expect(resp.body.error.message).toEqual("Not Found");
	});
});

afterAll(async function () {
	await afterAllHook();
});
