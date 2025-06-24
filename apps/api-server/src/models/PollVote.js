const userHasRole = require("../lib/sequelize-authorization/lib/hasRole");

module.exports = (db, sequelize, DataTypes) => {
	const PollVote = sequelize.define(
		"poll_vote",
		{
			pollId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},

			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 0,
			},

			ip: {
				type: DataTypes.STRING(64),
				allowNull: true,
				validate: {
					isIP: true,
				},
			},

			choice: {
				type: DataTypes.STRING(255),
				allowNull: false,
			},
		},
		{
			indexes: [
				{
					fields: ["pollId", "userId"],
					unique: true,
				},
			],
		},
	);

	PollVote.associate = (models) => {
		PollVote.belongsTo(models.Poll, { onDelete: "CASCADE" });
		PollVote.belongsTo(models.User, { onDelete: "CASCADE" });
	};

	PollVote.scopes = function scopes() {
		return {
			defaultScope: {},

			includePoll: () => ({
				include: [
					{
						model: db.Poll,
					},
				],
			}),
		};
	};

	PollVote.auth = PollVote.prototype.auth = {
		listableBy: "all",
		viewableBy: "all",
		createableBy: "member",
		updateableBy: ["editor", "owner"],
		deleteableBy: ["editor", "owner"],
		toAuthorizedJSON(user, result, self) {
			result.can = {};
			if (self.can("update", user)) result.can.edit = true;
			if (self.can("delete", user)) result.can.delete = true;
			return result;
		},
	};

	return PollVote;
};
