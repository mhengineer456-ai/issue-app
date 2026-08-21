const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude non-app scratch test scripts from Metro bundling
config.resolver.blockList = [
  /scratch\/.*/,
];

module.exports = config;
