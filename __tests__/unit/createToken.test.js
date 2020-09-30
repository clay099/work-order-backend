const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../../config");
const createToken = require("../../helpers/createToken");

describe("createToken()", () => {
	it("should create a token with email, id and user_type", () => {
		let token = createToken("john@gmail.com", 1, "user");
		let payload = jwt.verify(token, JWT_SECRET_KEY);
		expect(payload.email).toEqual("john@gmail.com");
		expect(payload.id).toEqual(1);
		expect(payload.user_type).toEqual("user");
		expect(Object.keys(payload).length).toEqual(4);
	});
});
