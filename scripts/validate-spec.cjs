const SwaggerParser = require('@apidevtools/swagger-parser')
const path = require('node:path')
const assert = require('node:assert/strict')
SwaggerParser.validate(path.resolve(__dirname, '../openapi.json')).then(api => {
  assert.deepEqual(Object.keys(api.paths).sort(), ['/id/stations', '/id/stations/{id}'])
  assert.deepEqual(api.security, [])
  console.log(`OpenAPI ${api.openapi}: validated two unauthenticated GET endpoints`)
}).catch(error => { console.error(error); process.exitCode = 1 })
