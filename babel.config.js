module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Enable React Native Reanimated plugin
      'react-native-reanimated/plugin',
      // Enable tree shaking for better bundle size
      ['transform-remove-console', { exclude: ['error', 'warn'] }],
    ],
  };
};