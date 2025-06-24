module.exports = (db, sequelize, DataTypes) => {
	const Lock = sequelize.define(
		"lock",
		{
			type: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			paranoid: false,
		},
	);

	Lock.auth = Lock.prototype.auth = {
		listableBy: "admin",
		viewableBy: "admin",
		createableBy: "admin",
		updateableBy: "admin",
		deleteableBy: "admin",
	};

	return Lock;
};
