// Typed models for the EaFlood SDK.
//
// GENERATED from the API model: main.kit.entity.<e>.fields{} and per-op
// params (op.<name>.points[].g.params[]). Field/param types come from the
// canonical type sentinels via @voxgig/sdkgen canonToType (source of truth:
// @voxgig/apidef VALID_CANON). Do not edit by hand.

export interface Station {
  "@id"?: string
  catchmentName?: string
  id?: string
  lat?: number
  long?: number
  riverName?: string
  stationReference?: string
  town?: string
}

export interface StationLoadMatch {
  id: string
}

export interface StationListMatch {
  limit?: number
  offset?: number
  parameter?: string
  river_name?: string
  search?: string
}

