import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

/** Directory containing this config file (publish-desk root). */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Avoid inferring workspace root from a parent folder’s package-lock.json (e.g. ~/package-lock.json).
  outputFileTracingRoot: projectRoot,
};

export default nextConfig;
