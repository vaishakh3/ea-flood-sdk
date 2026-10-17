import { describe, test } from 'node:test'
import { SDK } from '..'
import { runDefinitionPoint } from './definition-runner'
import { isControlSkipped } from './utility'


// Generated from the API definition, not from the model this SDK was built
// from: the route, the declared query parameters, the credential the security
// scheme names, and the definition's own response example.
const PLAN: any[] = [
  {
    "entity": "station",
    "accessor": "Station",
    "op": "list",
    "method": "GET",
    "path": "/id/stations",
    "args": [],
    "select": {
      "limit": "v1",
      "offset": "v1",
      "parameter": "v1",
      "river_name": "v1",
      "search": "v1"
    },
    "headers": [],
    "cookies": [],
    "responseMedia": [
      "application/json"
    ],
    "query": [
      "_limit",
      "_offset",
      "search",
      "parameter",
      "riverName"
    ],
    "queryArgs": [
      {
        "name": "limit",
        "wire": "_limit"
      },
      {
        "name": "offset",
        "wire": "_offset"
      },
      {
        "name": "parameter",
        "wire": "parameter"
      },
      {
        "name": "river_name",
        "wire": "riverName"
      },
      {
        "name": "search",
        "wire": "search"
      }
    ],
    "auth": null,
    "status": 200,
    "sample": {
      "@context": "x",
      "meta": {},
      "items": [
        {
          "@id": "x",
          "stationReference": "x",
          "label": "x",
          "lat": 1,
          "long": 1,
          "riverName": "x",
          "catchmentName": "x",
          "town": "x"
        }
      ]
    },
    "idField": "id"
  },
  {
    "entity": "station",
    "accessor": "Station",
    "op": "load",
    "method": "GET",
    "path": "/id/stations/{id}",
    "args": [
      {
        "name": "id",
        "wire": "id",
        "value": "p1"
      }
    ],
    "select": {},
    "headers": [],
    "cookies": [],
    "responseMedia": [
      "application/json"
    ],
    "query": [],
    "queryArgs": [],
    "auth": null,
    "status": 200,
    "sample": {
      "@context": "x",
      "meta": {},
      "items": {
        "@id": "x",
        "stationReference": "x",
        "label": "x",
        "lat": 1,
        "long": 1,
        "riverName": "x",
        "catchmentName": "x",
        "town": "x"
      }
    },
    "idField": "id"
  }
]


describe('definition', () => {
  for (const point of PLAN) {
    test(point.entity + '.' + point.op + ' ' + point.method + ' ' + point.path, async (t) => {
      const control = isControlSkipped('entityOp', point.entity + '.' + point.op, 'definition')
      if (control.skip) {
        t.skip(control.reason || 'skipped via sdk-test-control.json')
        return
      }
      await runDefinitionPoint(SDK, point)
    })
  }
})
