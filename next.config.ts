import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "assets.evolutionstables.nz",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "images.squarespace-cdn.com",
      },
    ],
  },
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
    const isCloudFunction = apiBase.includes("cloudfunctions.net");

    let ssotTarget = "http://localhost:8080";
    let assetsTarget = "http://localhost:8081";

    if (isCloudFunction) {
      // Strip any trailing function name (/ssot, /kyc, /assets) and append the target function name
      const origin = apiBase.replace(/\/ssot|\/assets|\/kyc/g, "");
      ssotTarget = `${origin}/ssot`;
      assetsTarget = `${origin}/assets`;
    }

    return [
      {
        source: "/api/ssot/:path*",
        destination: `${ssotTarget}/:path*`,
      },
      {
        source: "/api/assets/:path*",
        destination: `${assetsTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
