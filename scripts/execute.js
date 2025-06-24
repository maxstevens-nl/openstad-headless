const { spawn } = require("node:child_process");

module.exports = function execute(command, args, options) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, options);

		child.on("error", (err) => {
			reject(err);
		});

		child.stdout.on("data", (chunk) => {
			console.log(`${chunk}`.replace(/(?:\r|\n)+$/, ""));
		});

		child.stderr.on("data", (chunk) => {
			console.log(`${chunk}`.replace(/(?:\r|\n)+$/, ""));
		});

		child.on("close", () => {
			resolve();
		});
	});
};
