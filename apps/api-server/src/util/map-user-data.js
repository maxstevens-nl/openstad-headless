module.exports = function mapUserData({ map = {}, user = {} }) {
	if (typeof map === "string") {
		try {
			map = JSON.parse(map);
		} catch (err) {
			console.log(err);
		}
	}

	if (typeof map === "function") {
		return map(user);
	}

	const result = {
		idpUser: {
			identifier: mapKey("identifier"),
			accesstoken: user.accessToken,
		},
		// projectId: user.projectId,

		lastLogin: new Date(),
		isNotifiedAboutAnonymization: null,
	};

	// role only if mapped
	if (map.role) {
		result.role = mapKey("role");
	}

	// do mapping
	const keys = [
		"email",
		"nickName",
		"name",
		"phoneNumber",
		"address",
		"postcode",
		"city",
	];
	for (const key of keys) {
		result[key] = mapKey(key);
	}

	return result;

	function mapKey(key) {
		let propMap = map[key];

		if (!propMap) return user[key];

		if (typeof propMap === "string") {
			try {
				/* biome-ignore lint/security/noGlobalEval: You can define a mapping fn as a string in the json config. Parsing this requires eval... */
				propMap = eval(propMap);
			} catch (err) {}
		}

		if (typeof propMap === "function") {
			return propMap(user, key);
		}

		return user[propMap];
	}
};
