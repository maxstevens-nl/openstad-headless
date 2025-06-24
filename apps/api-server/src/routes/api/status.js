const express = require("express");
const db = require("../../db");
const auth = require("../../middleware/sequelize-authorization-middleware");
const pagination = require("../../middleware/pagination");

const router = express.Router({ mergeParams: true });

router.all("*", (req, res, next) => {
	req.scope = [];
	req.scope.push("defaultScope");
	req.scope.push({ method: ["forProjectId", req.project.id] });

	if (req.query.includeProject) {
		req.scope.push("includeProject");
	}

	if (req.query.statuses) {
		const statuses = req.query.statuses;
		req.scope.push({ method: ["onlyWithIds", statuses] });
	}

	next();
});

router
	.route("/")

	// list statuses
	// --------------
	.get(auth.can("Status", "list"))
	.get(auth.useReqUser)
	.get(pagination.init)
	.get((req, res, next) => {
		const { dbQuery } = req;

		req.scope.push({ method: ["forProjectId", req.params.projectId] });

		db.Status.scope(...req.scope)
			.findAndCountAll(dbQuery)
			.then((result) => {
				req.results = result.rows;
				req.dbQuery.count = result.count;
				next();
			})
			.catch(next);
	})
	.get(auth.useReqUser)
	.get(pagination.paginateResults)
	.get((req, res, next) => {
		res.json(req.results);
	})

	// create status
	// ---------------
	.post(auth.can("Status", "create"))
	.post((req, res, next) => {
		const data = {
			name: req.body.name,
			seqnr: req.body.seqnr,
			addToNewResources: req.body.addToNewResources,
			projectId: req.params.projectId,
		};

		db.Status.authorizeData(data, "create", req.user)
			.create(data)
			.then((result) => {
				res.json(result);
			})
			.catch(next);
	});

// with one existing status
// --------------------------
router
	.route("/:statusId(\\d+)")
	.all(auth.useReqUser)
	.all((req, res, next) => {
		const statusId = Number.parseInt(req.params.statusId);
		if (!statusId) next("No status id found");

		req.scope = ["defaultScope"];
		req.scope.push({ method: ["forProjectId", req.params.projectId] });

		db.Status.scope(...req.scope)
			.findOne({ where: { id: statusId } })
			.then((found) => {
				if (!found) throw new Error("Status not found");
				req.results = found;
				next();
			})
			.catch(next);
	})

	// view status
	// -------------
	.get(auth.can("Status", "view"))
	.get(auth.useReqUser)
	.get((req, res, next) => {
		res.json(req.results);
	})

	// update status
	// ---------------
	.put(auth.useReqUser)
	.put((req, res, next) => {
		const status = req.results;
		if (!status?.can?.("update"))
			return next(new Error("You cannot update this status"));
		status
			.authorizeData(req.body, "update")
			.update(req.body)
			.then((result) => {
				res.json(result);
			})
			.catch(next);
	})

	// delete status
	// ---------------
	.delete(auth.can("Status", "delete"))
	.delete((req, res, next) => {
		req.results
			.destroy()
			.then(() => {
				res.json({ status: "deleted" });
			})
			.catch(next);
	});

module.exports = router;
