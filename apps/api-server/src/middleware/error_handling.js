const createError = require("http-errors");
const statuses = require("statuses");

module.exports = (app) => {
	// We only get here when the request has not yet been handled by a route.
	app.use((req, res, next) => {
		console.log("4040404");
		next(createError(404, "Pagina niet gevonden"));
	});

	app.use(function handleError(err, req, res, next) {
		console.log(err);

		const env = app.get("env");
		const status =
			err.status ||
			(err.name && err.name === "SequelizeValidationError" && 400) ||
			500;
		const userIsAdmin = req.user?.role && req.user.role === "admin";
		const showDebug = status === 500 && (env === "development" || userIsAdmin);
		const friendlyStatus = statuses[status];
		const stack = err.stack || err.toString();
		let message = err.message || err.error;
		message = message?.replace(/Validation error:?\s*/, "");
		const errorStack = showDebug ? stack : "";

		res.status(status);
		res.json({
			status: status,
			friendlyStatus: friendlyStatus,
			message: message,
			errorStack: errorStack.replace(/\x20{2}/g, " &nbsp;"),
			error: message || err,
		});
	});
};
