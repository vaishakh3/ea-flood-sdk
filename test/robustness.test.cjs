const test = require('node:test')
const assert = require('node:assert/strict')
const { EaFloodSDK } = require('../sdk/ts/dist/EaFloodSDK.js')
const station = { '@id': 'http://environment.data.gov.uk/flood-monitoring/id/stations/example', stationReference: 'example', label: ['One', 'Two'], unknown: true }
function clientFor(body, status = 200, contentType = 'application/json') {
  const calls = []
  const client = new EaFloodSDK({ system: { fetch: async (url, init) => {
    calls.push({ url, init })
    return new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers: { 'content-type': contentType } })
  } } })
  return { client, calls }
}
const invoke = (client, op, ctrl) => client.Station()[op](op === 'load' ? { id: 'example' } : { limit: 1 }, ctrl)
for (const op of ['list', 'load']) {
  const invalid = op === 'list'
    ? [{}, { items: null }, { items: {} }, { items: 'abc' }, { items: [null] }, { items: [7] }, { items: [[]] }]
    : [{}, { items: null }, { items: [] }, { items: 'abc' }, { items: 7 }]
  for (const body of invalid) test(`${op} rejects malformed successful envelope ${JSON.stringify(body)}`, async () => {
    const { client } = clientFor(body)
    await assert.rejects(() => invoke(client, op), error => error.code === 'response_envelope_invalid' && error.status === 200)
  })
  for (const status of [404, 429, 500]) test(`${op} preserves HTTP ${status} errors`, async () => {
    const { client, calls } = clientFor({ error: 'fixture' }, status)
    await assert.rejects(() => invoke(client, op), error => error.code === 'request_status' && error.status === status)
    assert.equal(calls.length, 1, 'No automatic retries')
  })
  test(`${op} rejects malformed JSON`, async () => {
    const { client } = clientFor('{invalid')
    await assert.rejects(() => invoke(client, op), error => error.code === 'response_json_invalid')
  })
  test(`${op} rejects successful HTML`, async () => {
    const { client } = clientFor('<html>upstream unavailable</html>', 200, 'text/html')
    await assert.rejects(() => invoke(client, op), error => error.code === 'response_content_type')
  })
  test(`${op} pre-aborted signal prevents transmission`, async () => {
    const { client, calls } = clientFor({ items: op === 'list' ? [station] : station })
    await assert.rejects(() => invoke(client, op, { signal: AbortSignal.abort(new Error('cancelled')) }), error => error.code === 'request_aborted')
    assert.equal(calls.length, 0)
  })
  test(`${op} caller timeout terminates a stalled transport`, { timeout: 1000 }, async () => {
    let calls = 0
    const client = new EaFloodSDK({ system: { fetch: (_url, init) => new Promise((_resolve, reject) => {
      calls++
      const keepAlive = setTimeout(() => reject(new Error('Timeout was ignored')), 500)
      const abort = () => { clearTimeout(keepAlive); reject(init.signal.reason) }
      if (init.signal.aborted) abort()
      else init.signal.addEventListener('abort', abort, { once: true })
    }) } })
    await assert.rejects(() => invoke(client, op, { signal: AbortSignal.timeout(20) }), error => error.code === 'request_aborted' && error.cause?.name === 'TimeoutError')
    assert.equal(calls, 1)
  })
}
test('empty and whitespace lookup IDs fail without sending', async () => {
  const { client, calls } = clientFor({ items: station })
  for (const id of ['', '  ']) await assert.rejects(() => client.Station().load({ id }), error => error.code === 'request_parameter_invalid')
  assert.equal(calls.length, 0)
})
test('list returns new records; load populates and returns its calling entity', async () => {
  const listed = clientFor({ items: [station] })
  const query = listed.client.Station()
  const rows = await query.list({ limit: 1 })
  assert.deepEqual(query.data(), {})
  assert.deepEqual(rows[0].data(), station)
  const loaded = clientFor({ items: station }).client.Station()
  assert.equal(await loaded.load({ id: 'example' }), loaded)
  assert.deepEqual(loaded.data(), station)
  const copy = loaded.data(); copy.label.push('Changed')
  assert.deepEqual(loaded.data().label, ['One', 'Two'])
})
test('direct HTTP failures expose status/data and may omit err', async () => {
  for (const status of [404, 429, 500]) {
    const { client } = clientFor({ error: 'fixture' }, status)
    const result = await client.direct({ path: '/id/stations', method: 'GET' })
    assert.equal(result.ok, false); assert.equal(result.status, status)
    assert.deepEqual(result.data, { error: 'fixture' })
  }
})
test('direct deliberately preserves unvalidated response envelopes', async () => {
  const { client } = clientFor({ unexpected: 'fixture' })
  const result = await client.direct({ path: '/id/stations', method: 'GET' })
  assert.deepEqual(result.data, { unexpected: 'fixture' })
})
