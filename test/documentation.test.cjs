const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { EaFloodSDK } = require('../sdk/ts/dist/EaFloodSDK.js')
const root = path.resolve(__dirname, '..')
const read = file => fs.readFileSync(path.join(root, file), 'utf8')
const code = read('README.md').match(/```js\n([\s\S]*?)```/)[1]
test('root README example uses valid calls and decodes the lookup URI once', async () => {
  const urls = []
  const record = { '@id': 'http://environment.data.gov.uk/flood-monitoring/id/stations/a%20b', stationReference: 'a b' }
  class ExampleSDK extends EaFloodSDK {
    constructor(options) { super({ ...options, system: { fetch: async (url, init) => {
      urls.push(url); assert.ok(init.signal instanceof AbortSignal)
      return new Response(JSON.stringify({ items: urls.length === 1 ? [record] : record }), { headers: { 'content-type': 'application/json' } })
    } } }) }
  }
  const processFixture = { exitCode: 0 }
  await vm.runInNewContext(code, { require(name) { assert.equal(name, './sdk/ts/dist/EaFloodSDK.js'); return { EaFloodSDK: ExampleSDK } }, URL, AbortSignal, console: { log() {}, error() {} }, process: processFixture })
  assert.equal(processFixture.exitCode, 0)
  assert.equal(urls.length, 2)
  assert.equal(new URL(urls[1]).pathname, '/flood-monitoring/id/stations/a%20b')
})
test('root README example exits nonzero on a request error', async () => {
  class FailingSDK extends EaFloodSDK { constructor(options) { super({ ...options, system: { fetch: async () => { throw new Error('offline fixture') } } }) } }
  const processFixture = { exitCode: 0 }
  await vm.runInNewContext(code, { require: () => ({ EaFloodSDK: FailingSDK }), URL, AbortSignal, console: { log() {}, error() {} }, process: processFixture })
  assert.equal(processFixture.exitCode, 1)
})
test('reviewed station field tables match the generated declarations', () => {
  const source = read('sdk/ts/src/EaFloodTypes.ts').match(/export interface Station \{([\s\S]*?)\n\}/)[1]
  const fields = [...source.matchAll(/^\s+"?([@\w]+)"?\?:/gm)].map(match => match[1]).sort()
  for (const file of ['sdk/ts/README.md', 'sdk/ts/REFERENCE.md']) {
    const md = read(file)
    assert.doesNotMatch(md, /^\| `(context|items|meta|label)` \|/m)
    const section = md.split(/###?#+? Fields\n/).at(-1).split(/\n##/)[0]
    const rows = [...section.matchAll(/^\| `([^`]+)` \|/gm)].map(match => match[1]).sort()
    assert.deepEqual(rows, fields, file)
    assert.doesNotMatch(md, /\/api\/resource|method: 'DELETE'|Station\(data\?/)
  }
})
