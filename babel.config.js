module.exports = (api) => {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "babel-plugin-react-compiler",
        {
          target: "19", // React 19 target for optimal performance
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
