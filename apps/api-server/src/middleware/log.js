var log = require("debug")("app:http:activity");

module.exports = (app) => {
	app.use((req, res, next) => {
		var url = req.originalUrl;
		var method = req.method;
		var userId = req.user && req.user.id;
		var userRole = req.user && req.user.role;
		log(`${method} "${url}" ${userRole}(${userId})`);
		next();
	});
};
