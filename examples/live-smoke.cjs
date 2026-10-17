const assert = require('node:assert/strict')
const { EaFloodSDK } = require('../sdk/ts/dist/EaFloodSDK.js')

async function main() {
  const requests = []
  const client = new EaFloodSDK({ headers: { accept: 'application/json' }, system: { fetch: async (url, init) => {
    const started = Date.now()
    const response = await fetch(url, init)
    requests.push({ url, status: response.status, contentType: response.headers.get('content-type'), elapsedMs: Date.now() - started })
    return response
  } } })
  const listed = await client.Station().list({ limit: 2, parameter: 'level' }, { signal: AbortSignal.timeout(15000) })
  assert.ok(listed.length > 0 && listed.length <= 2)
  const record = listed[0].data()
  assert.equal(typeof record['@id'], 'string')
  const id = decodeURIComponent(new URL(record['@id']).pathname.split('/').at(-1))
  const loaded = (await client.Station().load({ id }, { signal: AbortSignal.timeout(15000) })).data()
  assert.equal(loaded['@id'], record['@id'])
  assert.equal(loaded.stationReference, record.stationReference)
  assert.equal(Object.hasOwn(loaded, 'items'), false)
  console.log(JSON.stringify({ checkedAt: new Date().toISOString(), passed: true, listCount: listed.length, stationId: id, requests }, null, 2))
}
main().catch(error => { console.error(error); process.exitCode = 1 })
