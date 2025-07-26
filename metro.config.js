const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add resolver configuration for better ES module support
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, "mjs"],
  alias: {
    ...config.resolver.alias,
    // Ensure ws-dottie is properly resolved
    "ws-dottie": require.resolve("ws-dottie"),
  },
};

// Add transformer configuration
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    ...config.transformer.minifierConfig,
    mangle: {
      ...config.transformer.minifierConfig?.mangle,
      keep_fnames: true,
    },
  },
  // Add support for ES modules
  experimentalImportSupport: false,
  allowOptionalDependencies: true,
};

module.exports = withNativeWind(config, { input: "./src/global.css" });
