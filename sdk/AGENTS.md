# SDK maintenance

This directory contains the actual Voxgig-generated TypeScript client and its scaffold. The repository root one level above is the evaluation project and authoritative quick start.

- Run `npm ci`, `npm run setup`, then `npm run verify` from the repository root.
- Edit the root `openapi.json`, `.sdk/model/project.aontu`, or `.sdk/model/guide/guide.aontu` for API/model changes.
- Run root `npm run generate` to synchronize the spec and regenerate code, tests and manifests. Do not hand-edit `ts/src` or `ts/test`.
- Top-level and target README phases are disabled to preserve reviewed documentation. Update README/reference snapshots deliberately when the model changes; examples are checked by the generated test suite.
- Keep the upstream MIT notices and Environment Agency OGL attribution.
- `npm run doctor` verifies the exact reviewed Config.fragment.ts default-envelope override against the installed upstream template, then checks raw doctor for only that fork. `npm run doctor:raw` intentionally exits 1 and exposes it. Reapplying/reviewing this override is required after a target resync; never suppress additional findings.
- No npm publication, release tags, deployment or CI workflow is configured.
- Use root `npm run test:live` only for the bounded, two-request public read-only smoke.
