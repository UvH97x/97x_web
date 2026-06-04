// next.config.mjs
export default {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'example.com' },
      { protocol: 'https', hostname: 'another-domain.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
  },
};