var config = require("config");
var CronJob = require("cron").CronJob;
var extend = require("lodash/extend");
var util = require("./util");

module.exports = {
	jobs: new Map(),

	start: function () {
		var jobs = this.jobs;
		util.invokeDir("./cron", (jobDef, fileName) => {
			try {
				var job = new CronJob(
					extend({}, jobDef, {
						timeZone: config.get("timeZone"),
						start: true,
					}),
				);
				jobs.set(fileName, job);
			} catch (e) {
				throw new Error("Invalid cron: " + e.message);
			}
		});
		return this;
	},
	stop: function () {
		for (const job of this.jobs) {
			job.stop();
		}
		return this;
	},
};
