/** Shared config for application; can be req'd many places. */

require("dotenv").config();

const SECRET = process.env.SECRET_KEY || "test";

const PORT = +process.env.PORT || 3001;

let JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "testKEY";

// database is:
//
// - on Heroku, get from env var DATABASE_URL
// - in testing, 'work-order-test'
// - else: 'work-order'

let DB_URI;

if (process.env.NODE_ENV === "test") {
	DB_URI = "work-order-test";
	BCRYPT_WORK_FACTOR = 1;
} else {
	DB_URI = process.env.DATABASE_URL || "work-order";
	BCRYPT_WORK_FACTOR = 12;
}

console.log("Using database", DB_URI);

module.exports = {
	SECRET,
	PORT,
	DB_URI,
	BCRYPT_WORK_FACTOR,
	JWT_SECRET_KEY,
};
