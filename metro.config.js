const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable tree shaking and minification
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Optimize bundle splitting
config.serializer.customSerializer = require('metro-serializer-esbuild');

// Enable asset optimization
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

// Optimize resolver for better performance
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

module.exports = config;