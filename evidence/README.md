# Verification evidence

All complete verification here ran in a Linux cloud workspace with Node 24.19.0 and npm 11.9.0. Test output, failures and timestamps are retained; absolute cloud workspace prefixes are replaced with `<PROJECT>`/`<TASK>` in the files listed below. Historical logs keep their original scaffold package metadata. their display timestamps use the process locale while embedded ISO timestamps are UTC.

- 01–02 are omitted because they are private local handover/setup logs. No successful Mac build/test is claimed.
- 03–05: cloud dependency install, actual pinned CLI re-scaffold, first generation; all exit 0.
- 06–08: initial TypeScript dependency install, build and generated suite; 212 pass, 9 skip.
- 09: independent contract baseline; 6 pass, 1 fail on load's wrapped response.
- 10–12: guide fix, rebuild, contracts; 7 pass.
- 13: first live list/load smoke, HTTP 200 each.
- 14: doctor clean before field refinements.
- 15: rejected attempted model alias (authoring error); no test 16 ran.
- 17–18: type refinements generated; stock headers-basic test failed after global Accept configuration.
- 19–22: Accept moved to constructor; generation, 212 generated passes/9 skips, 7 contract passes, clean doctor.
- 23–25: pinned OpenAPI validator installed; schema validation and consumer type checks passed.
- 26: full final verification passed; repeat generation identical over 96 target files.
- 27: bounded live rerun hit the 15-second timeout on station listing. This is not silently counted as a pass.
- 28: same final live command repeated successfully; listing and lookup HTTP 200.
- 29–31: separate clean source copy, all three locked installs from populated npm cache, then full verification passed.

The contracts use an injected mock transport and synthetic data. They verify generated SDK behavior against the documented/input contract, not exhaustive upstream compliance. The live smoke uses two real unauthenticated GET requests. The 9 generated skips are for unselected optional features, not hidden failing endpoints.

Resolved toolchain metadata is in toolchain-resolved.json and typescript-resolved.json. No npm publication or external submission is included. `32-public-metadata-generation.log` and `33-public-verification.log` record checks after configuring the public repository metadata.

Sanitized historical logs: 15-generate-types.log, 18-generated-tests-final.log, 09-contract-initial.log.

- 34–36: clean public-tree locked dependency installs, full verification, and bounded live smoke.
- 37: local consumer installation and runtime import passed.
- 38: final full verification after reviewed documentation corrections, exit 0; 212 generated passes, 9 skips, 7 contracts, schema/type checks, doctor and stable regeneration.
