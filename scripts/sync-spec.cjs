const { copyFileSync } = require('node:fs')
const { resolve } = require('node:path')
copyFileSync(resolve(__dirname, '../openapi.json'), resolve(__dirname, '../sdk/.sdk/def/openapi.json'))
