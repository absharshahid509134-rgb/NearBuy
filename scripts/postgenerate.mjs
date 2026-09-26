/**
 * Post-generate patch for Prisma client.
 *
 * When the native query engine cannot be downloaded (air-gapped builds), the
 * client is generated with `--no-engine`, which leaves `config.engineWasm`
 * unset. This script wires the BUNDLED WASM query engine (shipped inside
 * @prisma/client) into the generated client so driver adapters (@prisma/adapter-pg)
 * work on plain Node without any binary downloads.
 *
 * Safe to run after any `prisma generate` — it is idempotent.
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const runtimeDir = path.dirname(require.resolve('@prisma/client/runtime/wasm.js'))
const clientDir = path.dirname(require.resolve('.prisma/client/wasm.js'))

const glueSrc = path.join(runtimeDir, 'query_engine_bg.postgresql.js')
const wasmSrc = path.join(runtimeDir, 'query_engine_bg.postgresql.wasm')
const glueDst = path.join(clientDir, 'query_engine_bg.js')
const wasmDst = path.join(clientDir, 'query_engine_bg.wasm')

if (!existsSync(glueSrc) || !existsSync(wasmSrc)) {
  console.error('[postgenerate] bundled WASM engine not found in @prisma/client/runtime')
  process.exit(1)
}
copyFileSync(glueSrc, glueDst)
copyFileSync(wasmSrc, wasmDst)

const WIRING = `config.engineWasm = {
  getRuntime: () => require('./query_engine_bg.js'),
  getQueryEngineWasmModule: async () => {
    const fs = require('fs')
    const path = require('path')
    const bytes = fs.readFileSync(path.join(__dirname, 'query_engine_bg.wasm'))
    return new WebAssembly.Module(bytes)
  }
}`

// Node-compatible wasm loader (the generated one relies on runtime-specific
// `.wasm` module imports that plain Node does not support without flags).
const NODE_LOADER = `import { readFileSync } from 'node:fs'
const wasmModule = new WebAssembly.Module(readFileSync(new URL('./query_engine_bg.wasm', import.meta.url)))
export default Promise.resolve({ default: wasmModule })
`
writeFileSync(path.join(clientDir, 'wasm-worker-loader.mjs'), NODE_LOADER)
console.log('[postgenerate] installed Node-compatible wasm loader')

for (const file of ['wasm.js']) {
  const target = path.join(clientDir, file)
  let src = readFileSync(target, 'utf8')
  if (src.includes('config.engineWasm = undefined')) {
    src = src.replace('config.engineWasm = undefined', WIRING)
    writeFileSync(target, src)
    console.log(`[postgenerate] wired WASM engine into ${path.relative(root, target)}`)
  } else if (src.includes('getQueryEngineWasmModule')) {
    console.log(`[postgenerate] ${file} already wired`)
  } else {
    console.warn(`[postgenerate] unexpected ${file} contents — skipped`)
  }
}
console.log('[postgenerate] done')
