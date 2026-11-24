import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Run records are read from disk at build/request time; make sure they ship
  // with the server output so the results page works when deployed.
  outputFileTracingIncludes: {
    "/**": ["./results/**/*.json", "./public/sites/**/*.html"],
  },
  async rewrites() {
    // Serve /sites/<name>/ from public/sites/<name>/index.html (Next.js does not
    // serve directory indexes from public/ on its own).
    return [{ source: "/sites/:site", destination: "/sites/:site/index.html" }];
  },
  async headers() {
    return [
      {
        // Fictional test pages: keep them out of search engines.
        source: "/sites/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
