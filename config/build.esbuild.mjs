// config/build.esbuild.mjs
// Build AgentScript (full + 2D) with esbuild, preserving absolute-from-root
// imports like `/src/...` and `/vendor/...`.

import { build } from 'esbuild'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

// Plugin: map "/src/..." and "/vendor/..." to real filesystem paths
const rootAliases = {
    name: 'root-aliases',
    setup(b) {
        b.onResolve({ filter: /^\/src\// }, args => {
            const rel = args.path.slice('/src/'.length)
            return { path: path.join(projectRoot, 'src', rel) }
        })
        b.onResolve({ filter: /^\/vendor\// }, args => {
            const rel = args.path.slice('/vendor/'.length)
            return { path: path.join(projectRoot, 'vendor', rel) }
        })
    },
}

// Base options (no sourcemaps, no legal comments)
const base = {
    bundle: true,
    plugins: [rootAliases],
    legalComments: 'none',
}

// Build tasks (full + 2D)
await Promise.all([
    // Full (ESM)
    build({
        ...base,
        entryPoints: ['src/AS.js'],
        format: 'esm',
        outfile: 'dist/agentscript.js',
    }),
    // Full (ESM min)
    build({
        ...base,
        entryPoints: ['src/AS.js'],
        format: 'esm',
        minify: true,
        outfile: 'dist/agentscript.min.js',
    }),

    // 2D (ESM)
    build({
        ...base,
        entryPoints: ['src/AS2D.js'],
        format: 'esm',
        outfile: 'dist/agentscript2d.js',
    }),
    // 2D (ESM min)
    build({
        ...base,
        entryPoints: ['src/AS2D.js'],
        format: 'esm',
        minify: true,
        outfile: 'dist/agentscript2d.min.js',
    }),
])

console.log(
    '✅ esbuild complete → dist/agentscript(.js|.min.js) + dist/agentscript2d(.js|.min.js)'
)
