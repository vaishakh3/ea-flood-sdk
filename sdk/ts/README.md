# EaFlood TypeScript SDK



The TypeScript SDK for the EaFlood API — an entity-oriented client with TypeScript declarations and async/await support. See the [root README](../../README.md#source-and-regeneration) for type-inference limitations, including the label union.

The API is exposed as capitalised, semantic **Entities** — e.g.
`client.Station()` — each with a small set of operations (`list`, `load`)
instead of raw URL paths and query parameters. This keeps the surface
predictable and low-friction for both humans and AI agents.


## Install

This package is not published to npm, and no release tags are provided. Build the source locally first. From a shell:

```bash
git clone https://github.com/vaishakh3/ea-flood-sdk.git
cd ea-flood-sdk
npm ci
npm run setup
npm run build
```

From your consuming project's directory, install the built local package with `npm install /absolute/path/to/ea-flood-sdk/sdk/ts`. The package name `@vaishakh3/ea-flood-sdk` is a local manifest identifier, not a claim that an npm package or scope has been published or registered. Compiled files are produced by the build and are not committed.

This reviewed documentation snapshot is retained by the project model; see the root README's regeneration notes.


## Tutorial: your first API call

This tutorial walks through creating a client, listing entities, and
loading a specific record.

### 1. Create a client

```ts
import { EaFloodSDK } from '@vaishakh3/ea-flood-sdk'

const client = new EaFloodSDK({ headers: { accept: 'application/json' } })
```

### 2. List station records

`list()` resolves to an array of Station ENTITIES — every operation
resolves to entities, not raw records. Iterate them directly, and call
`.data()` on one for the record it holds:

```ts
const stations = await client.Station().list()

for (const station of stations) {
  console.log(station.data())
}
```

### 3. Load a station

`load()` returns the entity and throws on failure; `.data()` reads its record:

```ts
try {
  const station = await client.Station().load({ id: 'example_id' })
  console.log(station.data())
} catch (err) {
  console.error('load failed:', err)
}
```


## Error handling

Entity operations reject on failure, so wrap them in `try` / `catch`:

```ts
try {
  const stations = await client.Station().list()
  console.log(stations.map((item) => item.data()))
} catch (err) {
  console.error('list failed:', err)
}
```

The low-level `direct()` method does **not** throw — it returns the
result envelope. Branch on `ok`; on failure `status` holds the HTTP status
(for error responses) and `err` holds the error:

```ts
const result = await client.direct({
  path: '/api/resource/{id}',
  method: 'GET',
  params: { id: 'example_id' },
})

if (!result.ok) {
  console.error('request failed:', result.status, result.err)
}
```


## How-to guides

### Make a direct HTTP request

For endpoints not covered by entity methods:

```ts
const result = await client.direct({
  path: '/api/resource/{id}',
  method: 'GET',
  params: { id: 'example' },
})

if (result.ok) {
  console.log(result.status)  // 200
  console.log(result.data)    // response body
}
```

### Prepare a request without sending it

```ts
const fetchdef = await client.prepare({
  path: '/api/resource/{id}',
  method: 'DELETE',
  params: { id: 'example' },
})

// Inspect before sending
console.log(fetchdef.url)
console.log(fetchdef.method)
console.log(fetchdef.headers)
```

### Use test mode

Create a mock client for unit testing — no server required:

```ts
const client = EaFloodSDK.test()

const stations = await client.Station().list()
// stations is an array of Station entities, one per mock record
console.log(stations.map((station) => station.data()))
```

You can also use the instance method:

```ts
const client = new EaFloodSDK({ headers: { accept: 'application/json' } })
const testClient = client.tester()
```

### Retain entity state across calls

Entity instances remember their last match and data:

```ts
const entity = client.Station()

// First call runs the operation and stores its result
await entity.list()

// Subsequent calls reuse the stored state
const data = entity.data()
console.log(data.id)
```

### Add custom middleware

Pass features via the `extend` option:

```ts
const logger = {
  hooks: {
    PreRequest: (ctx: any) => {
      console.log('Requesting:', ctx.spec.method, ctx.spec.path)
    },
    PreResponse: (ctx: any) => {
      console.log('Status:', ctx.out.request?.status)
    },
  },
}

const client = new EaFloodSDK({
  extend: [logger],
})
```

### Run the bounded live smoke

From the repository root after the local build:

```bash
npm run test:live
```

This runs the reviewed `examples/live-smoke.cjs`: two unauthenticated GET requests (station list, then lookup), each bounded by a 15-second timeout. It does not enable unverified generated live scenarios or perform writes. The API can be slow or unavailable; a timeout is a failed attempt, not proof of an SDK defect.


## Reference

### EaFloodSDK

#### Constructor

```ts
new EaFloodSDK(options?: {
  base?: string
  prefix?: string
  suffix?: string
  feature?: Record<string, { active: boolean }>
  extend?: Feature[]
})
```

| Option | Type | Description |
| --- | --- | --- |
| `base` | `string` | Base URL of the API server. |
| `prefix` | `string` | URL path prefix prepended to all requests. |
| `suffix` | `string` | URL path suffix appended to all requests. |
| `feature` | `object` | Feature activation flags (e.g. `{ test: { active: true } }`). |
| `extend` | `Feature[]` | Additional feature instances to load. |

#### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `options()` | `object` | Deep copy of current SDK options. |
| `utility()` | `Utility` | Deep copy of the SDK utility object. |
| `prepare(fetchargs?)` | `Promise<FetchDef>` | Build an HTTP request definition without sending it. |
| `direct(fetchargs?)` | `Promise<DirectResult>` | Build and send an HTTP request. |
| `Station(data?)` | `StationEntity` | Create a Station entity instance. |
| `tester(testopts?, sdkopts?)` | `EaFloodSDK` | Create a test-mode client instance. |

#### Static methods

| Method | Returns | Description |
| --- | --- | --- |
| `EaFloodSDK.test(testopts?, sdkopts?)` | `EaFloodSDK` | Create a test-mode client. |

### Entity interface

All entities share the same interface.

#### Methods

| Method | Signature | Description |
| --- | --- | --- |
| `load` | `load(reqmatch?, ctrl?): Promise<Entity>` | Load a single entity by match criteria, and return it. |
| `list` | `list(reqmatch?, ctrl?): Promise<Entity[]>` | List entities matching the criteria, one per record. |
| `data` | `data(data?: Partial<Entity>): Entity` | Get or set entity data. |
| `match` | `match(match?: Partial<Entity>): Partial<Entity>` | Get or set entity match criteria. |
| `make` | `make(): Entity` | Create a new instance with the same options. |
| `client` | `client(): EaFloodSDK` | Return the parent SDK client. |
| `entopts` | `entopts(): object` | Return a copy of the entity options. |

#### Return values

Entity operations resolve to the entity itself — there is no result
envelope, and an entity's `data()` reads its record:

- `load` resolves to a single entity object.
- `list` resolves to an **array** of entity objects (iterate it directly;
  there is no `.data` and no `.ok`).

On a failed request these methods **throw**, so wrap calls in
`try`/`catch` to handle errors. Only `direct()` returns the result
envelope described below.

### DirectResult shape

The `direct()` method returns:

```ts
{
  ok: boolean
  status: number
  headers: object
  data: any
}
```

On error, `ok` is `false` and an `err` property contains the error.

### FetchDef shape

The `prepare()` method returns:

```ts
{
  url: string
  method: string
  headers: Record<string, string>
  body?: any
}
```

### Entities

#### Station

| Field | Description |
| --- | --- |
| `@id` |  |
| `catchmentName` |  |
| `context` |  |
| `id` |  |
| `items` |  |
| `label` |  |
| `lat` |  |
| `long` |  |
| `meta` |  |
| `riverName` |  |
| `stationReference` |  |
| `town` |  |

Operations: list, load.

API path: `/id/stations`



## Entities


### Station

Create an instance: `const station = client.Station()`

#### Operations

| Method | Description |
| --- | --- |
| `list(match)` | List entities matching the criteria. |
| `load(match)` | Load a single entity by match criteria. |

#### Fields

| Field | Type | Description |
| --- | --- | --- |
| `@id` | `string` |  |
| `catchmentName` | `string` |  |
| `context` | `string` |  |
| `id` | `string` |  |
| `items` | `Record<string, any>` |  |
| `label` | `string` |  |
| `lat` | `number` |  |
| `long` | `number` |  |
| `meta` | `Record<string, any>` |  |
| `riverName` | `string` |  |
| `stationReference` | `string` |  |
| `town` | `string` |  |

#### Example: Load

```ts
const station = await client.Station().load({ id: 'station_id' })
```

#### Example: List

```ts
const stations = await client.Station().list()
```

## Features

This SDK ships 1 optional features. Each is **inactive until you
switch it on**, so an SDK you have not configured behaves exactly as if none of
them existed — no retries, no cache, no logging, no measurable overhead.

Activate a feature by name in the client options, alongside the options shown
above:

| Feature | What it does |
|---|---|
| [`test`](#test) | Test transport |

### test

Test transport.

| Option | Default |
|---|---|
| `active` | `false` |

Set `feature.test.active` to enable it, then override any of the options above.


## Advanced

> The sections above cover everyday use. The material below explains the
> SDK's internals — useful when extending it with custom features, but not
> needed for normal use.

### The operation pipeline

Every entity operation follows a six-stage pipeline. Each stage fires a
feature hook before executing:

```
PrePoint → PreSpec → PreRequest → PreResponse → PreResult → PreDone
```

- **PrePoint**: Resolves which API endpoint to call based on the
  operation name and entity configuration.
- **PreSpec**: Builds the HTTP spec — URL, method, headers, body —
  from the resolved point and the caller's parameters.
- **PreRequest**: Sends the HTTP request. Features can intercept here
  to replace the transport (as TestFeature does with mocks).
- **PreResponse**: Parses the raw HTTP response.
- **PreResult**: Extracts the business data from the parsed response.
- **PreDone**: Final stage before returning to the caller. Entity
  state (match, data) is updated here.

If any stage errors, the pipeline short-circuits and the error surfaces
to the caller — see [Error handling](#error-handling) for how that looks
in this language.

### Features and hooks

Features are the extension mechanism. A feature is an object with a
`hooks` map. Each hook key is a pipeline stage name, and the value is
a function that receives the context.

The SDK ships with built-in features:

- **TestFeature**: Test transport

Features are initialized in order. Hooks fire in the order features
were added, so later features can override earlier ones.

### Module structure

```
ea-flood/
├── src/
│   ├── EaFloodSDK.ts        # Main SDK class
│   ├── entity/             # Entity implementations
│   ├── feature/            # Built-in features (Base, Test, Log)
│   └── utility/            # Utility functions
├── test/                   # Test suites
└── dist/                   # Compiled output
```

Import the SDK from the package root:

```ts
import { EaFloodSDK } from '@vaishakh3/ea-flood-sdk'
```

### Entity state

Entity instances are stateful. After a successful `list`, the entity
stores the returned data and match criteria internally. Subsequent
calls on the same instance can rely on this state.

```ts
const station = client.Station()
await station.list()

// station.data() now returns the station data from the last `list`
// station.match() returns the last match criteria
```

Call `make()` to create a fresh instance with the same configuration
but no stored state.

### Direct vs entity access

The entity interface handles URL construction, parameter placement,
and response parsing automatically. Use it for standard CRUD operations.

The `direct` method gives full control over the HTTP request. Use it
for non-standard endpoints, bulk operations, or any path not modelled
as an entity. The `prepare` method is useful for debugging — it
shows exactly what `direct` would send.


## Full Reference

See [REFERENCE.md](REFERENCE.md) for complete API reference
documentation including all method signatures, entity field schemas,
and detailed usage examples.
