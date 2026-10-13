import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {
    ignorePatterns: [
      "**/convex/**/_*",
      "**/.next",
      "**/dist",
      "**/.turbo",
      "**/dev-dist",
      "**/.zed",
      "**/.vscode",
      "**/routeTree.gen.ts",
      "**/worker-configuration.d.ts",
      "bts.jsonc",
      "**/.wrangler",
      "**/wrangler.toml",
      "**/.source",
    ],
    printWidth: 80,
    sortPackageJson: false,
    trailingComma: "es5",
  },
});
