const config = require("config");
const merge = require("merge");
const sanitize = require("../util/sanitize");

module.exports = (db, sequelize, DataTypes) => {
	const ChoicesGuideQuestionGroup = sequelize.define(
		"choices_guide_question_group",
		{
			choicesGuideId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},

			answerDimensions: {
				type: DataTypes.INTEGER,
				defaultValue: 1,
				allowNull: false,
			},

			title: {
				type: DataTypes.STRING(255),
				allowNull: false,
				defaultValue: "",
				validate: {
					len: {
						args: [2, 255],
						msg: "Titel moet tussen 2 en 255 tekens lang zijn",
					},
				},
				set: function (text) {
					this.setDataValue("title", sanitize.title(text.trim()));
				},
			},

			description: {
				type: DataTypes.TEXT,
				allowNull: false,
				defaultValue: "",
				validate: {
					len: {
						args: [0, 5000],
						msg: "Beschrijving moet tussen 0 en 5000 tekens zijn",
					},
				},
				set: function (text) {
					this.setDataValue("description", sanitize.content(text.trim()));
				},
			},

			images: {
				type: DataTypes.TEXT,
				allowNull: false,
				defaultValue: "{}",
				get: function () {
					let value = this.getDataValue("images");
					try {
						if (typeof value === "string") {
							value = JSON.parse(value);
						}
					} catch (err) {}
					return value;
				},
				set: function (value) {
					try {
						if (typeof value === "string") {
							value = JSON.parse(value);
						}
					} catch (err) {}
					this.setDataValue("images", JSON.stringify(value));
				},
			},

			seqnr: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{
			hooks: {
				beforeValidate: (instance, options) =>
					new Promise((resolve, reject) => {
						if (instance.choicesGuideId) {
							db.ChoicesGuide.scope("includeProject")
								.findByPk(instance.choicesGuideId)
								.then((choicesGuide) => {
									if (!choicesGuide) throw Error("ChoicesGuide niet gevonden");
									instance.config = merge.recursive(
										true,
										config,
										choicesGuide.project.config,
									);
									return choicesGuide;
								})
								.then((choicesGuide) => {
									return resolve();
								})
								.catch((err) => {
									throw err;
								});
						} else {
							instance.config = config;
							return resolve();
						}
					}),
			},

			individualHooks: true,
		},
	);

	ChoicesGuideQuestionGroup.associate = function (models) {
		this.belongsTo(models.ChoicesGuide, { onDelete: "CASCADE" });
		this.hasMany(models.ChoicesGuideQuestion, {
			foreignKey: "questionGroupId",
			onDelete: "CASCADE",
			hooks: true,
		});
		this.hasMany(models.ChoicesGuideChoice, {
			foreignKey: "questionGroupId",
			onDelete: "CASCADE",
			hooks: true,
		});
	};

	ChoicesGuideQuestionGroup.scopes = function scopes() {
		return {
			forProjectId: (projectId) => ({
				where: {
					choicesGuideId: [
						sequelize.literal(
							`select id FROM choicesGuides WHERE projectId = ${projectId}`,
						),
					],
				},
			}),

			includeChoicesGuide: {
				include: [
					{
						model: db.ChoicesGuide,
						attributes: ["id", "", "status"],
					},
				],
			},

			includeChoices: () => ({
				include: [
					{
						model: db.ChoicesGuideChoice,
					},
				],
			}),

			includeQuestions: () => ({
				include: [
					{
						model: db.ChoicesGuideQuestion,
					},
				],
			}),
		};
	};

	// dit is hoe het momenteel werkt; ik denk niet dat dat de bedoeling is, maar ik volg nu
	ChoicesGuideQuestionGroup.auth = ChoicesGuideQuestionGroup.prototype.auth = {
		listableBy: "all",
		viewableBy: "all",
		createableBy: "editor",
		updateableBy: "editor",
		deleteableBy: "admin",
	};

	return ChoicesGuideQuestionGroup;
};
