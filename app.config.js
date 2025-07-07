module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://test-giftcard8-api.gcard8.com',
    },
  };
}; 