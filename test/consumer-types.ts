import type { StationRecord } from '../types/station-record'
import type { StationListMatch, StationLoadMatch, Station } from '../sdk/ts/dist/EaFloodTypes'

const single: StationRecord = { label: 'Station', '@id': 'https://example.org/stations/one' }
const multiple: StationRecord = { label: ['Station', 'Alternate'], extraData: true }
const partial: StationRecord = {}
const list: StationListMatch = { limit: 0, offset: 0, river_name: 'River Example' }
const load: StationLoadMatch = { id: 'example_id' }
const generated: Station = { '@id': 'https://example.org/stations/one', lat: 51.75 }
// @ts-expect-error Numeric labels are outside the observed/documented contract.
const invalidLabel: StationRecord = { label: 42 }
// @ts-expect-error A lookup requires a URI identifier.
const missingId: StationLoadMatch = {}
// @ts-expect-error The generated query surface uses river_name, not riverName.
const invalidQuery: StationListMatch = { riverName: 'River Example' }
void [single, multiple, partial, list, load, generated, invalidLabel, missingId, invalidQuery]
