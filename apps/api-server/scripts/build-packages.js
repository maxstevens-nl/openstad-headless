const getWidgetSettings = require("../src/routes/widget/widget-settings");
const widgetDefinitions = getWidgetSettings();

const {
	buildPackage,
	getDependencyPackages,
	buildPackageByDirectory,
} = require("./lib/build-package");
const fs = require("node:fs");
const { hashElement } = require("folder-hash");

async function buildAllPackages() {
	// Calculate hash over all packages

	// Check if there was already a hash calculated, if so, and it matches current hash, skip build
	const hashFile = "../../.packages-build-hash";
	let oldHash = null;

	if (fs.existsSync(hashFile)) {
		oldHash = fs.readFileSync(hashFile, "utf8");
	}

	const currentHash = await hashElement("../../packages", {
		folders: {
			exclude: [".*", "node_modules", "dist", "build", "coverage", "public"],
		},
	});

	// If hash matches, skip build
	if (oldHash !== null && oldHash === currentHash.hash) {
		console.log("No changes detected, skipping build");
		return;
	}

	// Write new hash to file
	fs.writeFileSync(hashFile, currentHash.hash);

	const packages = Object.keys(widgetDefinitions);
	const dependencyPackages = await getDependencyPackages();

	// Build all dependency packages
	dependencyPackages.forEach((pkg) => {
		buildPackageByDirectory(pkg);
	});

	// Build all non-dependency packages
	packages.forEach((pkg) => {
		buildPackage(pkg);
	});
}

buildAllPackages();
