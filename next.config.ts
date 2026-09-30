import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp", "@prisma/client"],
  experimental: {
    serverActions: { bodySizeLimit: "130mb" },
  },
};

export default nextConfig;
