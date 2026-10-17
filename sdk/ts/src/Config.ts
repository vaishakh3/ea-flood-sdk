
import { BaseFeature } from './feature/base/BaseFeature'
import { TestFeature } from './feature/test/TestFeature'



const FEATURE_CLASS: Record<string, typeof BaseFeature> = {
   test: TestFeature,

}


const FEATURE_PLUGINS: Record<string, any[]> = {
  
}


class Config {

  makeFeature(this: any, fn: string) {
    const fc = FEATURE_CLASS[fn]
    const fi = new fc()
    return fi
  }

  // False for a feature added at runtime via options.extend (station's
  // adopt path) - the constructor uses this to skip makeFeature for names
  // no generated class backs.
  hasFeature(this: any, fn: string) {
    return null != FEATURE_CLASS[fn]
  }


  main = {
    name: 'EaFlood',
        slug: "ea-flood",
    version: "0.0.1",
    target: "ts",

  }


  feature = {
     test:     {
      "options": {
        "active": false
      },
      "optspec": {
        "entity": "`$MAP`",
        "net": "`$MAP`"
      },
      "strict": false,
      "transport": "base"
    },

  }


  options = {
    base: "https://environment.data.gov.uk/flood-monitoring",

    headers: {
      "content-type": "application/json"
    },

    entity: {
      
        station: {
        },
  
    }
  }


  entity = {
    "station": {
      "fields": [
        {
          "name": "@id",
          "title": "Station URI",
          "type": "`$STRING`",
          "format": "uri"
        },
        {
          "name": "catchmentName",
          "title": "Catchment Name",
          "type": "`$STRING`"
        },
        {
          "name": "id",
          "title": "Id",
          "type": "`$STRING`",
          "format": "uri"
        },
        {
          "name": "lat",
          "title": "Lat",
          "type": "`$NUMBER`"
        },
        {
          "name": "long",
          "title": "Long",
          "type": "`$NUMBER`"
        },
        {
          "name": "riverName",
          "title": "River Name",
          "type": "`$STRING`"
        },
        {
          "name": "stationReference",
          "title": "Station Reference",
          "type": "`$STRING`"
        },
        {
          "name": "town",
          "title": "Town",
          "type": "`$STRING`"
        }
      ],
      "id": {
        "field": "id",
        "name": "id"
      },
      "name": "station",
      "op": {
        "list": {
          "input": "data",
          "name": "list",
          "points": [
            {
              "kind": "http",
              "method": "GET",
              "orig": "/id/stations",
              "segments": [
                {
                  "lit": "id"
                },
                {
                  "lit": "stations"
                }
              ],
              "parts": [
                "id",
                "stations"
              ],
              "rename": {},
              "transform": {
                "req": "`reqdata`",
                "res": "`body.items`"
              },
              "args": {
                "query": [
                  {
                    "name": "limit",
                    "orig": "_limit",
                    "type": "`$INTEGER`",
                    "kind": "query"
                  },
                  {
                    "name": "offset",
                    "orig": "_offset",
                    "type": "`$INTEGER`",
                    "kind": "query"
                  },
                  {
                    "name": "parameter",
                    "orig": "parameter",
                    "type": "`$STRING`",
                    "kind": "query"
                  },
                  {
                    "name": "river_name",
                    "orig": "riverName",
                    "type": "`$STRING`",
                    "kind": "query"
                  },
                  {
                    "name": "search",
                    "orig": "search",
                    "type": "`$STRING`",
                    "kind": "query"
                  }
                ]
              },
              "select": {},
              "response": {
                "kind": "json",
                "media": "application/json"
              }
            }
          ]
        },
        "load": {
          "input": "data",
          "name": "load",
          "points": [
            {
              "kind": "http",
              "method": "GET",
              "orig": "/id/stations/{id}",
              "segments": [
                {
                  "lit": "id"
                },
                {
                  "lit": "stations"
                },
                {
                  "var": "id"
                }
              ],
              "parts": [
                "id",
                "stations",
                "{id}"
              ],
              "rename": {},
              "transform": {
                "req": "`reqdata`",
                "res": "`body.items`"
              },
              "args": {
                "params": [
                  {
                    "name": "id",
                    "orig": "id",
                    "type": "`$STRING`",
                    "kind": "param",
                    "reqd": true
                  }
                ]
              },
              "select": {
                "exist": [
                  "id"
                ]
              },
              "response": {
                "kind": "json",
                "media": "application/json"
              }
            }
          ]
        }
      },
      "relations": {
        "ancestors": []
      }
    }
  }
}


const config = new Config()

export {
  config,
  FEATURE_PLUGINS,
}

