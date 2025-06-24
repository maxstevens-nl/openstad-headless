const config = require("config");
const dbConfig = config.get("database");
const mysql = require("mysql2");
const express = require("express");
const createError = require("http-errors");

const pool = mysql.createPool({
	host: dbConfig.host,
	user: dbConfig.user,
	password: dbConfig.password,
	database: dbConfig.database,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
});

const router = express.Router({ mergeParams: true });

// for all get requests
router.all("*", (req, res, next) => next());

router
	.route("/total")

	// count resources
	// -----------
	.get((req, res, next) => {
		const query =
			"SELECT count(resources.id) AS counted FROM resources WHERE resources.publishDate < NOW() AND resources.deletedAt IS NULL AND resources.projectId=?";
		const bindvars = [req.params.projectId];

		pool
			.promise()
			.query(query, bindvars)
			.then(([rows, fields]) => {
				const counted = rows?.[0]?.counted || -1;
				res.json({ count: counted });
			})
			.catch((err) => {
				next(err);
			});
	});

module.exports = router;
