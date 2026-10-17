# Station envelope guard

Project-owned feature template. Change the source under `sdk/.sdk/tm/ts/src/feature/envelope`, then regenerate from the repository root. Do not hand-edit the emitted target copy.

The guard is enabled by the reviewed Config.fragment.ts default. It rejects malformed successful station list/load containers and blank lookup IDs; it does not validate all fields or affect direct(). Explicit offline test mode uses synthetic fixtures and bypasses response checks. Normal-pipeline regression coverage is in root test/robustness.test.cjs.
