const bcrypt = require("bcrypt");
const db = require("../db");
const saltRounds = 10;
const Promise = require("bluebird");

exports.all = (req, res, next) => {
	res.render("admin/user/all", {
		users: req.users,
	});
};

exports.edit = (req, res) => {
	const userRoles = req.user.roles;

	const userClients = req.clients.map((client) => {
		client.userRole = userRoles
			? userRoles.find((userRole) => userRole.clientId === client.id)
			: {};
		return client;
	});

	res.render("admin/user/edit", {
		user: req.userObject,
		roles: req.roles,
		clients: userClients,
		userRoles: userRoles,
	});
};

exports.new = (req, res) => {
	res.render("admin/user/new", {
		roles: req.roles,
		clients: req.clients,
	});
};

/**
 * @TODO validation
 */
exports.create = (req, res, next) => {
	let {
		name,
		email,
		streetName,
		houseNumber,
		suffix,
		postcode,
		city,
		phoneNumber,
		hashedPhoneNumber,
		password,
	} = req.body;

	password = bcrypt.hashSync(password, saltRounds);

	db.User.create({
		name,
		email,
		streetName,
		houseNumber,
		suffix,
		postcode,
		city,
		phoneNumber,
		password,
	})
		.then((response) => {
			req.flash("success", { msg: "Succesfully created " });
			res.redirect(`/admin/user/${response.id}`);
		})
		.catch((err) => {
			next(err);
		});
};

exports.update = (req, res, next) => {
	const keysToUpdate = [
		"name",
		"email",
		"streetName",
		"houseNumber",
		"suffix",
		"postcode",
		"city",
		"phoneNumber",
		"hashedPhoneNumber",
		"password",
		"requiredFields",
		"exposedFields",
		"authTypes",
	];

	const data = {};
	keysToUpdate.forEach((key) => {
		if (req.body[key]) {
			let value = req.body[key];

			if (key === "password") {
				value = bcrypt.hashSync(value, saltRounds);
			}

			data[key] = value;
		}
	});

	const roles = req.body.roles;
	const userId = req.params.userId;

	const saveRoles = [];

	for (const clientId in roles) {
		const roleId = roles[clientId];
		const parsedClientId = Number.parseInt(clientId.replace("'", ""), 10);
		saveRoles.push(() => {
			return createOrUpdateUserRole(parsedClientId, userId, roleId);
		});
	}

	Promise.map(saveRoles, (saveRole) => {
		return saveRole();
	})
		.then(() => {
			return req.userObject.update(data);
		})
		.then(() => {
			req.flash("success", { msg: "Updated user!" });
			res.redirect(`/admin/user/${req.userObject.id}`);
		})
		.catch((err) => {
			req.flash("error", { msg: "Error!" });
			res.redirect(`/admin/user/${req.userObject.id}`);
		});
};

const createOrUpdateUserRole = (clientId, userId, roleId) => {
	return new Promise((resolve, reject) => {
		db.UserRole.findOne({ where: { clientId, userId } })
			.then((userRole) => {
				if (userRole) {
					return userRole.update({ roleId });
				}
				return db.UserRole.create({ clientId, roleId, userId });
			})
			.then(() => {
				resolve();
			})
			.catch((err) => {
				reject(err);
			});
	});
};
