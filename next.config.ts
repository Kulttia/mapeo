import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // PGlite carga su WASM desde node_modules; empaquetarlo rompe la ruta.
  serverExternalPackages: ["@electric-sql/pglite"],
  partialPrefetching: true,
  // Transcripciones .docx de reuniones largas superan el 1 MB por defecto; Vercel admite hasta 4,5 MB.
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
