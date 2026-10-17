# Voxgig SDK generator: short observations report

Date: 17 October 2026. API: Environment Agency flood-monitoring stations. Scope: list and load stations in TypeScript. The 804-repository Voxgig catalogue had no equivalent API; Open-Meteo's global-flood SDK is distinct.

## Actual workflow

Used `npm create --yes @voxgig/sdkgen@0.30.8 -- ea-flood -d ./openapi.json -o ./sdk -t ts -f test`, then the scaffold's `npm run generate`. Resolved versions: sdkgen 4.35.0, apidef 8.25.3, model 12.0.1, docgen 0.30.2. The OpenAPI input was authored from official docs; it is not an upstream-provided spec. Work moved from Mac to cloud after the first dependency install was interrupted; all completed builds and tests ran in cloud.

## What worked

The public npm workflow required no generator account or API credentials. It produced the entity-oriented TypeScript client, documentation and a substantial offline suite. Query-name translation and path encoding worked. The model-guide fix survived regeneration. The initial evaluation had clean doctor output; the final hardening exception is described below. Live generated-client list and lookup both returned HTTP 200.

## Findings worth improving

1. Response-envelope inference was inconsistent. List extracted `body.items`; load returned the whole envelope. Six of seven independent contract tests passed initially, with lookup failing. A guide-level `body.items` transform fixed it without editing generated code.
2. Field inference mixed envelope fields into the Station type, normalized `@id` to `id`, and reduced the input spec's string-or-array label to string. Project declarations remove envelope fields and add literal `@id`. The inaccurate label field is disabled; an explicitly handwritten consumer subset type supplies the union. Precise generated union typing remains a limitation.
3. Adding an Accept header in the global model made the stock `headers-basic` test fail because its expected headers were fixed. Passing Accept at client construction instead preserved behavior and the stock suite. The failure log is retained; this was a generated-test assumption, not an HTTP failure.
4. Generated install/repository links defaulted to a nonexistent Voxgig repository. The npm package remains unpublished. Public-source packaging sets the actual repository/author/local package metadata and uses verified clone-and-build instructions. Reviewed docs are preserved using the supported top/readme phase switches because stock install text assumes a root-level language directory and committed build output.
5. The [customization page](https://voxgig.com/sdk/custom) uses `project.aon` and other `.aon` examples; the installed/versioned workflow uses `.aontu`. The versioned guide was the reliable reference.
6. Valid JSON with a missing or wrongly shaped `items` value could silently become empty/invalid entities. A project-owned envelope feature now rejects it for normal list/load calls. One small source configuration-fragment customization enables the guard by default; emitted SDK files remain generated. Raw doctor correctly exits 1 for this intentional fork. A strict checker allows only the exact reviewed change and rejects other drift. A future target resync must preserve/reapply it.
7. Generated docs retained disabled fields and overstated list state/direct-error behavior. Reviewed snapshots now match the runtime, and regression tests check the field tables and root example.

## Verification and boundaries

Final generated suite: 212 passed, 9 skipped, none failed. Independent contract/error/documentation suite: 40 passed. Skips concern unselected optional features. A fresh public checkout installed all three lockfiles from an empty npm cache and completed the documented workflow. Final live checks passed: list/load 200, zero-limit empty listing 200 and expected missing-station HTML 404; the root example exited 0. Consumer installation, packaged type checking, malformed-response/HTTP-error/cancellation tests and repeat generation across 100 files also passed.

The envelope guard checks containers and object-shaped records, not every field; explicit offline test mode bypasses it for synthetic fixtures, while independent normal-pipeline tests validate it. `direct()` remains a low-level unvalidated envelope API. No automatic retries/default deadlines, production resilience, other API endpoints, or all station filters are claimed. Historical failures/timeouts and final results are retained under `evidence/`. No API key, account or extra integration is needed.

The initial npm configuration/cache problems were environment setup issues. A rejected attempted model alias was an authoring mistake, corrected before delivery. Neither is presented as a generator defect.

This work was AI-assisted throughout. No human-use experience or human elapsed time was invented. Source is under MIT; API data retains Open Government Licence attribution. The approved public source destination is `vaishakh3/ea-flood-sdk`. No npm release or external submission is included.

Sources: [Voxgig generator](https://voxgig.com/sdk), [versioned runbook](https://github.com/voxgig/create-sdkgen/blob/main/AGENTS.md), [API reference](https://environment.data.gov.uk/flood-monitoring/doc/reference), [catalogue](https://github.com/orgs/voxgig-sdk/repositories).
