# Environment Agency stations SDK: Voxgig evaluation

A small, working TypeScript SDK generated with the actual Voxgig toolchain for England's Environment Agency flood-monitoring API. This evaluation covers two read-only endpoints: station listing and lookup. It is unofficial and unaffiliated with the Environment Agency. Source is maintained at [vaishakh3/ea-flood-sdk](https://github.com/vaishakh3/ea-flood-sdk); the npm package is not published.

No account, key or payment is needed. The input `openapi.json` is an AI-authored subset based on the [provider reference](https://environment.data.gov.uk/flood-monitoring/doc/reference), not an official OpenAPI specification. The SDK is an evaluation, not a flood-warning or emergency decision system.

## Quick start

Node 24.19 or later and npm are required. Clone the source, then work from its root directory:

```sh
git clone https://github.com/vaishakh3/ea-flood-sdk.git
cd ea-flood-sdk
npm ci
npm run setup
npm run verify
npm run test:live
```

`npm ci` and `npm run setup` install locked public npm dependencies. `verify` regenerates the SDK, validates the OpenAPI input, compiles TypeScript, runs offline suites and checks generator drift. `test:live` makes two public GET requests with a 15-second timeout each. The live script enables Node's standard environment-proxy support for cloud environments; it also works without a proxy.

```js
const { EaFloodSDK } = require('./sdk/ts/dist/EaFloodSDK.js')

async function main() {
  const client = new EaFloodSDK({ headers: { accept: 'application/json' } })
  const stations = await client.Station().list({ limit: 2, parameter: 'level' })
  for (const station of stations) console.log(station.data())

  if (stations.length) {
    // The service's stationReference can differ from its URI identifier.
    const uri = stations[0].data()['@id']
    const id = new URL(uri).pathname.split('/').at(-1)
    const station = await client.Station().load({ id })
    console.log(station.data())
  }
}
main().catch(console.error)
```

Generated query names are `limit`, `offset`, `search`, `parameter`, and `river_name`; the SDK sends `_limit`, `_offset`, and `riverName` on the wire. Listing returns an array of entities; lookup returns one entity. Call `.data()` to read the station record. `direct()` retains the provider's complete envelope, including `meta`.

## What was verified

On 17 October 2026, in a Linux cloud workspace using Node 24.19.0:

- All 804 public `voxgig-sdk` repository names were checked; no Environment Agency flood-monitoring SDK was found. `global-flood-sdk` wraps Open-Meteo, a different API.
- The actual pinned scaffold and generator ran successfully.
- Generated TypeScript suite: 212 passed, 0 failed, 9 skipped. Skips cover optional features not generated here; only the `test` feature was selected.
- Seven additional HTTP-contract tests passed, including query/path encoding, envelopes, empty lists, HTML 404 errors and metadata preservation.
- Live generated-client listing and lookup returned HTTP 200 and consistent station IDs.
- OpenAPI validation, consumer type checks and doctor passed. Repeat generation was byte-identical across 96 TypeScript source/test/doc/manifest files.
- One live rerun timed out after 15 seconds; its repeat passed. All outcomes are retained in `evidence/`.
- A separate clean source copy installed all three lockfiles from the populated npm cache and passed the complete verification command.

Offline passes do not establish every upstream response shape, optional feature or production behavior. Live data may be delayed; this project makes no freshness guarantee.

## Source and regeneration

- `openapi.json`: editable, limited API description
- `sdk/.sdk/model/guide/guide.aontu`: single-station `items` unwrapping
- `sdk/.sdk/model/project.aontu`: remove envelope-only fields from entity types and restore the literal `@id` field
- `sdk/ts/`: actual generated SDK, tests and documentation
- `test/contract.test.cjs`: independent API-shape tests using an injected transport
- `types/station-record.d.ts`: manually authored consumer-side subset type, including `label?: string | string[]` and unknown extra fields
- `examples/live-smoke.cjs`: repeatable, bounded live verification
- `REPORT.md`: candid generator observations and remaining limitations

`npm run generate` copies the root input into the scaffold before regeneration. SDK code changes belong in the input/model, not in generated `sdk/ts/src` files. No stock generator template or component was forked. For public packaging, the supported `main.kit.phase.top.active: false` and `main.kit.target.ts.phase.readme.active: false` switches preserve reviewed documentation and omit unused top-level release workflows. The SDK code, tests and manifests remain generated; the reviewed README/reference snapshots must be updated deliberately if the API model changes.

The generator's stock type inference narrows the input spec's `label` union incorrectly. Its generated label field is disabled here, while runtime data is preserved. TypeScript consumers can use the separate `StationRecord` subset type when reading data, after any validation their application needs. This type is not runtime validation. The generated optional `id` is a generic model field, not the upstream station URI; use `@id` for lookup.

Repository, author and local package metadata are set in the project model. `@vaishakh3/ea-flood-sdk` is the local package identifier; it does not imply an npm publication or registered scope. To use it in another project, first build as above, then run `npm install /absolute/path/to/ea-flood-sdk/sdk/ts` from that project. No release tags, hosted documentation or CI/deployment service are configured here.

Historical logs retain the original scaffold package name. Fresh public-tree checks are recorded separately in `evidence/`.

## License and attribution

Project source is under MIT; retain the upstream Voxgig MIT notices in generated files. Third-party API data and provider documentation remain under their own license, the [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/), not MIT.

This uses Environment Agency flood and river level data from the real-time data API (Beta).

AI assisted all research, input-spec authoring, generation, customization, tests and this report. No human hands-on time was measured or fabricated. GitHub source publication is separate from npm publication. No npm release or external submission is included.
