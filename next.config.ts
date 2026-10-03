import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Garante que os JSONs das fichas vão junto no deploy (modo somente leitura).
  outputFileTracingIncludes: {
    "/": ["./content/data/**"],
  },
};

export default nextConfig;
