import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react({
			babel: {
				plugins: [["babel-plugin-react-compiler"]],
			},
		}),
		tailwindcss(),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
		// Ensure node_modules resolution works for shared directory
		// Dedupe zod to ensure it's resolved from ClientApp's node_modules
		dedupe: ["zod"],
	},
	// Ensure Vite resolves node_modules from ClientApp root
	// This is important for resolving dependencies in the shared directory
	root: __dirname,
});
