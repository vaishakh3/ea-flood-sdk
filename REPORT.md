# Voxgig SDK generator: short observations report

Date: 17 October 2026. API: Environment Agency flood-monitoring stations. Scope: list and load stations in TypeScript. The 804-repository Voxgig catalogue had no equivalent API; Open-Meteo's global-flood SDK is distinct.

## Actual workflow

Used `npm create --yes @voxgig/sdkgen@0.30.8 -- ea-flood -d ./openapi.json -o ./sdk -t ts -f test`, then the scaffold's `npm run generate`. Resolved versions: sdkgen 4.35.0, apidef 8.25.3, model 12.0.1, docgen 0.30.2. The OpenAPI input was authored from official docs; it is not an upstream-provided spec. Work moved from Mac to cloud after the first dependency install was interrupted; all completed builds and tests ran in cloud.

## What worked

The public npm workflow required no generator account or API credentials. It produced the entity-oriented TypeScript client, documentation and a substantial offline suite. Query-name translation and path encoding worked. The model-guide fix survived regeneration, and doctor reported no template/component drift. Live generated-client list and lookup both returned HTTP 200.

## Findings worth improving

1. Response-envelope inference was inconsistent. List extracted `body.items`; load returned the whole envelope. Six of seven independent contract tests passed initially, with lookup failing. A guide-level `body.items` transform fixed it without editing generated code.
2. Field inference mixed envelope fields into the Station type, normalized `@id` to `id`, and reduced the input spec's string-or-array label to string. Project declarations remove envelope fields and add literal `@id`. The inaccurate label field is disabled; an explicitly handwritten consumer subset type supplies the union. Precise generated union typing remains a limitation.
3. Adding an Accept header in the global model made the stock `headers-basic` test fail because its expected headers were fixed. Passing Accept at client construction instead preserved behavior and the stock suite. The failure log is retained; this was a generated-test assumption, not an HTTP failure.
4. Generated install/repository links defaulted to a nonexistent Voxgig repository. The npm package remains unpublished. Public-source packaging sets the actual repository/author/local package metadata and uses verified clone-and-build instructions. Reviewed docs are preserved using the supported top/readme phase switches because stock install text assumes a root-level language directory and committed build output.
5. Website examples still mention `.aon`; the current package and repository guide require `.aontu`. The versioned guide was the reliable reference.

## Verification and boundaries

Final generated suite: 212 passed, 9 skipped, none failed. Independent contracts: 7 passed. Skips concern unselected optional features. A final two-request live smoke passed after one list request hit the 15-second timeout; all attempts are retained. Input validation, consumer type checking, doctor and repeat generation passed. All 96 generated TypeScript source/test/doc/manifest files were byte-identical on repeat generation. A clean-copy locked install from cache followed by full verification also passed. No claim covers retry, rate limiting, production resilience or all Environment Agency endpoints.

The initial npm configuration/cache problems were environment setup issues. A rejected attempted model alias was an authoring mistake, corrected before delivery. Neither is presented as a generator defect.

This work was AI-assisted throughout. No human-use experience or human elapsed time was invented. Source is under MIT; API data retains Open Government Licence attribution. The approved public source destination is `vaishakh3/ea-flood-sdk`. No npm release or external submission is included.

Sources: [Voxgig generator](https://voxgig.com/sdk), [versioned runbook](https://github.com/voxgig/create-sdkgen/blob/main/AGENTS.md), [API reference](https://environment.data.gov.uk/flood-monitoring/doc/reference), [catalogue](https://github.com/orgs/voxgig-sdk/repositories).
