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
  assert.deepEqual(await client.Station().list({ limit: 0 }, { signal: AbortSignal.timeout(15000) }), [])
  await assert.rejects(() => client.Station().load({ id: 'voxgig-sdk-evaluation-nonexistent-station' }, { signal: AbortSignal.timeout(15000) }), error => error.status === 404)
  console.log(JSON.stringify({ checkedAt: new Date().toISOString(), passed: true, checks: ['zero-limit empty list', 'nonexistent station rejected as 404'], requests }, null, 2))
}
main().catch(error => { console.error(error); process.exitCode = 1 })
