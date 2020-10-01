/** Express app for work-order-backend. */
const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());

const ExpressError = require("./helpers/expressError");

// add logging system
const morgan = require("morgan");
app.use(morgan("tiny"));

// set up authentication middleware
const { authenticateJWT } = require("./middleware/auth");
app.use(authenticateJWT);

// import routes
const usersRoutes = require("./routes/users");
const tradesmenRoutes = require("./routes/tradesmen");
const projectsRoutes = require("./routes/projects");
const chatRoutes = require("./routes/chats");
const reviewRoutes = require("./routes/reviews");
const photosRoutes = require("./routes/photos");
const authRoutes = require("./routes/auth");

// user routes
app.use("/users", usersRoutes);
app.use("/tradesmen", tradesmenRoutes);
app.use("/projects", projectsRoutes);
app.use("/chat", chatRoutes);
app.use("/reviews", reviewRoutes);
app.use("/photos", photosRoutes);
app.use("/", authRoutes);

/** 404 handler */
app.use(function (req, res, next) {
	const err = new ExpressError("Not Found", 404);

	// pass the error to the next piece of middleware
	return next(err);
});

/** general error handler */

app.use(function (err, req, res, next) {
	if (err.stack) console.log(err.stack);

	res.status(err.status || 500);

	return res.json({
		error: err,
	});
});

module.exports = app;
