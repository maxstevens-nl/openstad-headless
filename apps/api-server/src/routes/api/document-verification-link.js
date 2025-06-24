const crypto = require("node:crypto");

const express = require("express");
const router = express.Router({ mergeParams: true });

router.route("/").get((req, res, next) => {
	const ttl = Date.now() + 60 * 1000;

	if (!process.env.IMAGE_VERIFICATION_TOKEN)
		throw new Error("API config error: IMAGE_VERIFICATION_TOKEN is empty");
	const secret = process.env.IMAGE_VERIFICATION_TOKEN + ttl;
	const hash = crypto.createHmac("sha256", secret).digest("hex");
	let url = `${process.env.IMAGE_APP_URL}/document?exp_date=${ttl}&signature=${hash}`;
	let protocol = "";

	if (!url.startsWith("http://") && !url.startsWith("https://")) {
		protocol = process.env.FORCE_HTTP ? "http://" : "https://";
	}

	url = protocol + url;

	res.json(url);
});

module.exports = router;
