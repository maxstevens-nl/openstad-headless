const fs = require("node:fs").promises;
const util = require("node:util");
const exec = util.promisify(require("node:child_process").exec);

exports.contructComponentsCdn = async () => {
	// construct cdn urls
	let openstadComponentsCdn =
		process.env.OPENSTAD_COMPONENTS_CDN ||
		"https://cdn.jsdelivr.net/npm/openstad-components@{version}/dist";

	console.log("@@@ openstadComponentsCdn", openstadComponentsCdn);

	if (openstadComponentsCdn.match("{version}")) {
		try {
			const tag = await getTag();

			// get current published version
			({ stdout, stderr } = await exec("npm view --json openstad-components"));
			let info = stdout?.toString();
			info = JSON.parse(info);
			let version = info["dist-tags"][tag];
			if (!version) {
				// fallback
				const packageFile =
					(await fs.readFile(`${__dirname}/../package.json`).toString()) || "";
				const match = packageFile?.match(
					/"openstad-components":\s*"(?:[^"\d]*)((?:\d+\.)*\d+)"/,
				);
				version = match?.[1] || "";
			}
			openstadComponentsCdn = openstadComponentsCdn.replace(
				"@{version}",
				version ? `@${version}` : "",
			);
			console.log("Using cdn", openstadComponentsCdn);
		} catch (err) {
			console.log("Error constructing cdn url", err);
		}
	}

	console.log("@@@ openstadComponentsCdn", openstadComponentsCdn);

	return openstadComponentsCdn;
};

exports.contructReactAdminCdn = async () => {
	// construct cdn urls
	let openstadReactAdminCdn =
		process.env.OPENSTAD_REACT_ADMIN_CDN ||
		"https://cdn.jsdelivr.net/npm/openstad-react-admin@{version}/dist";
	if (openstadReactAdminCdn.match("{version}")) {
		try {
			const tag = await getTag();

			// get current published version
			({ stdout, stderr } = await exec("npm view --json openstad-react-admin"));
			let info = stdout?.toString();
			info = JSON.parse(info);
			let version = info["dist-tags"][tag];
			if (!version) {
				// fallback
				const packageFile =
					(await fs.readFile(`${__dirname}/../package.json`).toString()) || "";
				const match = packageFile?.match(
					/"openstad-react-openstadComponentsCdn":\s*"(?:[^"\d]*)((?:\d+\.)*\d+)"/,
				);
				version = match?.[1] || "";
			}
			openstadReactAdminCdn = openstadReactAdminCdn.replace(
				"@{version}",
				version ? `@${version}` : "",
			);
			console.log("Using cdn", openstadReactAdminCdn);
		} catch (err) {
			console.log("Error constructing cdn url", err);
		}
	}

	return openstadReactAdminCdn;
};

async function getTag() {
	const util = require("node:util");
	const exec = util.promisify(require("node:child_process").exec);

	let branch = "";
	let tag = "alpha";

	try {
		const { stdout, stderr } = await exec("git rev-parse --abbrev-ref HEAD");
		branch = stdout?.toString().trim();
	} catch (error) {
		// As a fallback we check for the CDN_DIST_TAG env variable
		if (process.env.CDN_DIST_TAG) {
			tag = process.env.CDN_DIST_TAG;
		}
		console.warn(`Could not get branch via git; fallback to ${tag}`);
	}

	if (branch === "release") tag = "beta";
	if (branch === "master") tag = "latest";

	return tag;
}
