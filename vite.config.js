import basicSsl from '@vitejs/plugin-basic-ssl'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
	server: {
		host: true,
		// https: true,
		open: true,
		proxy: {
			'/nyc': {
				target: 'https://maps.nyc.gov', // Your external API base URL
				changeOrigin: true, // Needed for virtual hosted sites (e.g., API might be hosted on a different domain)
				rewrite: path => path.replace(/^\/nyc/, ''), // Optionally remove /api from the request
				secure: false, // Disable SSL verification (useful when dealing with self-signed certs)
			},
		},
	},
	root: 'src',
	envDir: '../',
	build: {
		// Relative to the root
		outDir: '../dist',
		chunkSizeWarningLimit: 1500,
		rolldownOptions: {
			output: {
				// Rolldown can't handle circular dependencies in @arcgis/core
				// when splitting into separate chunks. Grouping all ArcGIS/Esri
				// modules into one vendor chunk avoids runtime errors.
				manualChunks(id) {
					if (id.includes('node_modules/@arcgis/') || id.includes('node_modules/@esri/')) {
						return 'vendor-arcgis'
					}
				},
			},
		},
	},
	base: './',
	plugins: [
		basicSsl(),
		viteStaticCopy({
			targets: [
				{
					src: './config/config.json',
					dest: '.',
				},
			],
		}),
		{
			name: 'build-logger',
			closeBundle() {
				console.log(
					'👉👉👉 Did you check the CHANGELOG.md File before delivering to the customer?',
				)
			},
		},
		// basicSsl(),
		react({
			// Use React plugin in all *.jsx and *.tsx files
			include: '**/*.{jsx,tsx}',
		}),
	],
})
