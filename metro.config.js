// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

const { withNativeWind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */

const config = getDefaultConfig(__dirname);

// Configure esbuild to handle JSX in .js files
config.resolver.platforms = ["native", "web"];
config.transformer.minifierConfig = {
  ...config.transformer.minifierConfig,
  loader: {
    ".js": "jsx",
  },
};

module.exports = withNativeWind(config, { input: "./src/global.css" });
