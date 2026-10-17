/** Consumer-side type for this API subset; manually authored, not generated. */
export interface StationRecord {
  '@id'?: string
  stationReference?: string
  label?: string | string[]
  lat?: number
  long?: number
  riverName?: string
  catchmentName?: string
  town?: string
  [field: string]: unknown
}
