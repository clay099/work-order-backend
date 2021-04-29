/** Database setup for backend. */

const { Client } = require("pg");
const { DB_URI } = require("./config");

const client = new Client({
	connectionString: `${DB_URI}${
		process.env.NODE_ENV === "production" ? "sslmode=require" : ""
	}`,
});

console.log({ client });
client.connect();

module.exports = client;
