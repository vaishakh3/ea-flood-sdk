# Environment Agency stations SDK: Voxgig evaluation

A small, working TypeScript SDK generated with the actual Voxgig toolchain for England's Environment Agency flood-monitoring API. This evaluation covers two read-only endpoints: station listing and lookup, with five modeled list filters. It does not implement the wider API’s warnings, readings, measures or all station filters. It is unofficial and unaffiliated with the Environment Agency. Source is maintained at [vaishakh3/ea-flood-sdk](https://github.com/vaishakh3/ea-flood-sdk); the npm package is not published.

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
  const stations = await client.Station().list(
    { limit: 2, parameter: 'level' }, { signal: AbortSignal.timeout(15000) })
  for (const station of stations) console.log(station.data())

  if (stations.length) {
    // The service's stationReference can differ from its URI identifier.
    const uri = stations[0].data()['@id']
    const id = decodeURIComponent(new URL(uri).pathname.split('/').at(-1))
    const station = await client.Station().load({ id }, { signal: AbortSignal.timeout(15000) })
    console.log(station.data())
  }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
```

Generated query names are `limit`, `offset`, `search`, `parameter`, and `river_name`; the SDK sends `_limit`, `_offset`, and `riverName` on the wire. Listing returns an array of entities; lookup returns one entity. Call `.data()` to read the station record. `direct()` retains the provider's complete envelope, including `meta`.

## Runtime boundaries

No API account, credential, payment, database or service deployment is required. Only internet access to the public provider is needed for live calls. Node must be able to reach npm for first installation. In proxy-based environments, run standalone examples with `node --use-env-proxy`; the live scripts already do this.

The default envelope guard rejects malformed successful list/load containers with `response_envelope_invalid` and rejects empty lookup IDs before sending. It preserves unknown fields but does not validate every station field. Explicit offline test mode uses synthetic fixtures and bypasses this guard; the independent contract suite exercises it through the normal response pipeline. `direct()` deliberately returns the unvalidated provider envelope; HTTP failures may omit `err`, so check `ok`, `status` and `data`. Invalid arguments may reject. There are no automatic retries or default deadlines; pass a fresh `AbortSignal.timeout(15000)` per request, as above.

Use the default or map-style `feature` options to retain the guard. The advanced array form defines an explicit feature order: include `{ name: 'envelope', active: true }` in that array, otherwise the guard is not installed even though merged options can still show it as active.

`npm run test:live:edges` makes two additional bounded GETs: an empty zero-limit listing and a deliberately nonexistent station that must return 404. No write requests are made.

## What was verified

On 17 October 2026, in a Linux cloud workspace using Node 24.19.0:

- All 804 public `voxgig-sdk` repository names were checked; no Environment Agency flood-monitoring SDK was found. `global-flood-sdk` wraps Open-Meteo, a different API.
- The actual pinned scaffold and generator ran successfully.
- Generated TypeScript suite: 212 passed, 0 failed, 9 skipped. Skips cover optional features not generated here; the original scaffold selected the `test` feature; final QA adds the default envelope guard.
- The original seven contracts passed; final QA expands this to 41 independent contract, error-path and documentation tests, including malformed envelopes, HTTP failures, cancellation and timeout handling.
- Final live generated-client listing and lookup returned HTTP 200 and consistent station IDs. A zero-limit list returned []; a nonexistent station correctly rejected an HTML 404. The exact root README example also ran live with exit code 0.
- OpenAPI validation, consumer type checks and the exact-customization scaffold check passed. Raw doctor deliberately reports one reviewed configuration-fragment fork; it is not a clean upstream match. Repeat generation was byte-identical across 100 target source/test/doc/manifest files.
- One live rerun timed out after 15 seconds; its repeat passed. All outcomes are retained in `evidence/`.
- Final QA cloned the published commit into an empty directory, installed all three lockfiles using a fresh empty npm cache, and passed the README workflow before further hardening. Final checks and fixes are recorded separately in `evidence/`.

Offline passes do not establish every upstream response shape, optional feature or production behavior. Live data may be delayed; this project makes no freshness guarantee.

## Source and regeneration

- `openapi.json`: editable, limited API description
- `sdk/.sdk/model/guide/guide.aontu`: single-station `items` unwrapping
- `sdk/.sdk/model/project.aontu`: remove envelope-only fields from entity types and restore the literal `@id` field
- `sdk/ts/`: actual generated SDK, tests and documentation
- `test/contract.test.cjs`: independent API-shape tests using an injected transport
- `sdk/.sdk/tm/ts/src/feature/envelope/StationRecord.ts`: handwritten consumer-side subset template, packaged as `@vaishakh3/ea-flood-sdk/dist/feature/envelope/StationRecord.js`, including `label?: string | string[]` and unknown extra fields
- `examples/live-smoke.cjs`: repeatable, bounded live verification
- `REPORT.md`: candid generator observations and remaining limitations

`npm run generate` copies the root input into the scaffold before regeneration. SDK code changes belong in the input/model, not in generated `sdk/ts/src` files. The project adds an envelope-guard feature and customizes one generator configuration fragment to enable it by default. `scripts/check-scaffold.cjs` verifies that this exact reviewed customization is the only upstream fragment change; raw doctor output remains available with `npm run doctor:raw` (expected exit 1 for this single intentional fork). A future `target add ts` resync can overwrite it; reapply/review the default before use. No emitted runtime file is hand-edited. For public packaging, the supported `main.kit.phase.top.active: false` and `main.kit.target.ts.phase.readme.active: false` switches preserve reviewed documentation and omit unused top-level release workflows. The SDK code, tests and manifests remain generated; the reviewed README/reference snapshots must be updated deliberately if the API model changes.

The generator's stock type inference narrows the input spec's `label` union incorrectly. Its generated label field is disabled here, while runtime data is preserved. TypeScript consumers can import the packaged subset with `import type { StationRecord } from '@vaishakh3/ea-flood-sdk/dist/feature/envelope/StationRecord.js'` after local installation, and use it when reading data after any field validation their application needs. This type is not runtime validation. The generated optional `id` is a generic model field, not the upstream station URI; use `@id` for lookup.

Repository, author and local package metadata are set in the project model. `@vaishakh3/ea-flood-sdk` is the local package identifier; it does not imply an npm publication or registered scope. To use it in another project, first build as above, then run `npm install /absolute/path/to/ea-flood-sdk/sdk/ts` from that project. No release tags, hosted documentation or CI/deployment service are configured here.

Historical logs retain the original scaffold package name. Fresh public-tree checks are recorded separately in `evidence/`.

## License and attribution

Project source is under MIT; retain the upstream Voxgig MIT notices in generated files. Third-party API data and provider documentation remain under their own license, the [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/), not MIT.

This uses Environment Agency flood and river level data from the real-time data API (Beta).

AI assisted all research, input-spec authoring, generation, customization, tests and this report. No human hands-on time was measured or fabricated. GitHub source publication is separate from npm publication. No npm release or external submission is included.
