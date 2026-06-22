// next.config.mjs
export default {
  outputFileTracingIncludes: {
    '/articles/[genre]/[slug]': ['./src/data/articles/**/*.md'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'example.com' },
      { protocol: 'https', hostname: 'another-domain.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
  },
};