const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude non-app scratch test scripts from Metro bundling
config.resolver.blockList = [
  /scratch\/.*/,
];

// Delete deprecated watcher option if present
if (config.watcher) {
  delete config.watcher.unstable_workerThreads;
}

module.exports = config;
