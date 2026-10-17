const test = require('node:test')
const assert = require('node:assert/strict')
const { EaFloodSDK } = require('../sdk/ts/dist/EaFloodSDK.js')

const station = {
  '@id': 'http://environment.data.gov.uk/flood-monitoring/id/stations/example_1',
  stationReference: 'example 1', label: ['Example station', 'Alternative label'],
  lat: 51.75, long: -1.25, riverName: 'River Example',
  futureField: { retained: true },
}
const envelope = items => ({ '@context': 'https://example.org/context', meta: { publisher: 'Environment Agency' }, items })
function clientFor(body, status = 200, contentType = 'application/json') {
  const requests = []
  const client = new EaFloodSDK({ headers: { accept: 'application/json' }, system: { fetch: async (url, init) => {
    requests.push({ url, init })
    return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
      status, headers: { 'content-type': contentType },
    })
  } } })
  return { client, requests }
}

test('list unwraps items and preserves actual station data including unknown fields', async () => {
  const { client, requests } = clientFor(envelope([station]))
  const entities = await client.Station().list({ limit: 2, offset: 0, search: 'River A & B', parameter: 'level', river_name: 'River Example' })
  assert.equal(entities.length, 1)
  assert.deepEqual(entities[0].data(), station)
  const url = new URL(requests[0].url)
  assert.equal(url.pathname, '/flood-monitoring/id/stations')
  assert.equal(url.searchParams.get('_limit'), '2')
  assert.equal(url.searchParams.get('_offset'), '0')
  assert.equal(url.searchParams.get('riverName'), 'River Example')
  assert.equal(url.searchParams.get('search'), 'River A & B')
  assert.equal(url.searchParams.get('parameter'), 'level')
  assert.equal(url.searchParams.has('river_name'), false)
  assert.equal(requests[0].init.method, 'GET')
  assert.equal(new Headers(requests[0].init.headers).has('authorization'), false)
})

test('load unwraps the single-object items envelope', async () => {
  const { client, requests } = clientFor(envelope(station))
  const entity = await client.Station().load({ id: 'example_1' })
  assert.deepEqual(entity.data(), station)
  assert.equal(new URL(requests[0].url).pathname, '/flood-monitoring/id/stations/example_1')
})

test('empty list and zero limit are valid', async () => {
  const { client, requests } = clientFor(envelope([]))
  assert.deepEqual(await client.Station().list({ limit: 0 }), [])
  assert.equal(new URL(requests[0].url).searchParams.get('_limit'), '0')
})

test('lookup uses the @id final segment, not the display stationReference', async () => {
  const { client, requests } = clientFor(envelope(station))
  const id = new URL(station['@id']).pathname.split('/').at(-1)
  await client.Station().load({ id })
  assert.equal(new URL(requests[0].url).pathname.split('/').at(-1), 'example_1')
})

test('path values are encoded, preventing path/query injection', async () => {
  const { client, requests } = clientFor(envelope(station))
  await client.Station().load({ id: 'a/b?c&d' })
  assert.equal(new URL(requests[0].url).pathname, '/flood-monitoring/id/stations/a%2Fb%3Fc%26d')
  assert.equal(new URL(requests[0].url).search, '')
})

test('HTML 404 is rejected rather than exposed as station data', async () => {
  const { client } = clientFor('<html><body>Not found</body></html>', 404, 'text/html')
  await assert.rejects(() => client.Station().load({ id: 'missing' }), err => {
    assert.match(err.message, /404/)
    return true
  })
})

test('direct preserves the full metadata envelope and HTTP status', async () => {
  const { client } = clientFor(envelope([station]))
  const result = await client.direct({ path: '/id/stations', method: 'GET', query: { _limit: 1 } })
  assert.equal(result.ok, true)
  assert.equal(result.status, 200)
  assert.deepEqual(result.data, envelope([station]))
})
