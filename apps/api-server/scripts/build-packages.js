const { execSync, exec } = require('child_process');
const getWidgetSettings = require('../src/routes/widget/widget-settings');
const widgetDefinitions = getWidgetSettings();

const {
  buildPackage,
  getDependencyPackages,
  buildPackageByDirectory,
} = require('./lib/build-package');
const fs = require('fs');
const { hashElement } = require('folder-hash');
const path = require('path');

async function buildAllPackages() {
  // Calculate hash over all packages

  const rootDir = path.resolve(__dirname, '../../../');

  // Check if there was already a hash calculated, if so, and it matches current hash, skip build
  const hashFile = path.resolve(rootDir, '.packages-build-hash')
  let oldHash = null;

  if (fs.existsSync(hashFile)) {
    oldHash = fs.readFileSync(hashFile, 'utf8');
  }

  const packagesFolder = path.resolve(rootDir, 'packages');
  const currentHash = await hashElement(packagesFolder, {
    folders: {
      exclude: ['.*', 'node_modules', 'dist', 'build', 'coverage', 'public'],
    },
  });

  // If hash matches, skip build
  if (oldHash !== null && oldHash === currentHash.hash) {
    console.log('No changes detected, skipping build');
    return;
  }

  // Write new hash to file
  fs.writeFileSync(hashFile, currentHash.hash);

  const packages = Object.keys(widgetDefinitions);
  const dependencyPackages = await getDependencyPackages();

  // Build all dependency packages
  dependencyPackages.forEach((package) => {
    buildPackageByDirectory(package);
  });

  // Build all non-dependency packages
  packages.forEach((package) => {
    buildPackage(package);
  });
}

buildAllPackages();
