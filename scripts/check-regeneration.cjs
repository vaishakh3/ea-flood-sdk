const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const root = path.resolve(__dirname, '..')
const target = path.join(root, 'sdk/ts')
function snapshot(dir = target) {
  const entries = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (['node_modules', 'dist', 'dist-test', '.jostraca'].includes(entry.name) || entry.name.endsWith('.tsbuildinfo')) continue
    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) entries.push(...snapshot(file))
    else if (entry.isFile()) entries.push([path.relative(target, file), crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')])
  }
  return entries
}
const before = snapshot()
const generated = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'generate'], { cwd: root, stdio: 'inherit' })
if (generated.status !== 0) process.exit(generated.status || 1)
const after = snapshot()
assert.deepEqual(after, before, 'Generated TypeScript source, tests, manifests or docs changed on repeat generation')
console.log(JSON.stringify({ passed: true, filesCompared: after.length, scope: 'sdk/ts source, tests, docs and manifests; excludes dependencies and compiler outputs', sha256: crypto.createHash('sha256').update(JSON.stringify(after)).digest('hex') }, null, 2))
