

import Path from 'node:path'
import * as Fs from 'node:fs'

import { test, describe, afterEach } from 'node:test'
import assert from 'node:assert'
import { createLiveTransport } from '../../live-runner'
import { runLiveEntity } from '../../live-entity'


import { EaFloodSDK, BaseFeature, config, stdutil } from '../../..'

import {
  envOverride,
  liveClientOptions,
  liveDelay,
  loadEnvLocal,
  makeCtrl,
  makeMatch,
  makeReqdata,
  makeStepData,
  makeValid,
  maybeSkipControl,
} from '../../utility'


loadEnvLocal(__dirname + '/../../../.env.local')


describe('StationEntity', async () => {

  // Per-test live pacing. Delay is read from sdk-test-control.json's
  // `test.live.delayMs`; only sleeps when EA_FLOOD_TEST_LIVE=TRUE.
  afterEach(liveDelay('EA_FLOOD_TEST_LIVE'))

  test('instance', async () => {
    const testsdk = EaFloodSDK.test()
    const ent = testsdk.Station()
    assert(null != ent)
  })


  class FailHook extends BaseFeature {
    name = 'failhook'
    version = '0.0.1'
    active = true
    unexpected = 0
    init() { }
    PreSpec() { throw new Error('station hook failed') }
    PreUnexpected() { this.unexpected++ }
  }

  test('stream-error', async () => {
    const offline = { net: { offline: true } }
    await assert.rejects(async () => {
      for await (const _item of EaFloodSDK.test(offline).Station().stream('list')) { }
    }, /offline/)

    for await (const _item of EaFloodSDK.test(offline).Station()
      .stream('list', undefined, { ctrl: { throw: false } })) { }

    if (null != (config as any).feature?.rbac) {
      const denied = EaFloodSDK.test(undefined, { feature: { rbac: { active: true, deny: true } } })
      await assert.rejects(async () => {
        for await (const _item of denied.Station().stream('list')) { }
      }, (err: any) => 'rbac_denied' === err.code)
    }
  })

  test('stream-ctrl', async () => {
    const explain: any = {}
    const ctrl: any = { explain }
    for await (const _item of EaFloodSDK.test().Station().stream('list', undefined, { ctrl })) { }
    assert.deepStrictEqual(Object.keys(ctrl), ['explain'])
    assert(explain === ctrl.explain && 0 < Object.keys(explain).length)
  })

  test('unexpected', async () => {
    const hook = new FailHook()
    const client = new EaFloodSDK({ feature: { test: { active: true } }, extend: [hook] })
    await assert.rejects(client.Station().list(), /hook failed/)
    assert(0 < hook.unexpected)

    const fired = hook.unexpected
    assert.strictEqual(await client.Station().list(undefined, { throw: false }), undefined)
    assert(fired < hook.unexpected)
  })

  test('validate', async (t) => {
    if (null == (config as any).feature?.validate) {
      t.skip('feature not present in this SDK: validate')
      return
    }
    const client = EaFloodSDK.test(undefined, { feature: { validate: { active: true } } })
    await assert.rejects(client.Station().list({"limit":"x"} as any),
      (err: any) => 'validate_failed' === err.code)
  })



  test('basic', async (t) => {

    const live = 'TRUE' === process.env.EA_FLOOD_TEST_LIVE
    for (const op of ['list', 'load']) {
      if (!live && maybeSkipControl(t, 'entityOp', 'station.' + op, live)) return
    }

    
    const setup = basicSetup()
    if (setup.live) {
      return runLiveEntity(setup, {"active":true,"alias":{"field":{}},"fields":{"@id":{"a":true,"fo":"uri","h":"Station URI","n":"@id","r":false,"t":"`$STRING`","key$":"@id"},"catchmentName":{"a":true,"h":"Catchment Name","n":"catchmentName","r":false,"t":"`$STRING`","key$":"catchmentName"},"context":{"a":false,"h":"Context","n":"context","r":false,"t":"`$STRING`","key$":"context"},"id":{"a":true,"fo":"uri","h":"Id","n":"id","r":false,"t":"`$STRING`","key$":"id"},"items":{"a":false,"h":"Items","n":"items","r":true,"t":"`$OBJECT`","union":{"branches":2,"count":1,"depth":2},"key$":"items"},"label":{"a":false,"h":"Label","n":"label","r":false,"t":"`$STRING`","union":{"branches":2,"count":1,"depth":0},"key$":"label"},"lat":{"a":true,"h":"Lat","n":"lat","r":false,"t":"`$NUMBER`","key$":"lat"},"long":{"a":true,"h":"Long","n":"long","r":false,"t":"`$NUMBER`","key$":"long"},"meta":{"a":false,"h":"Meta","n":"meta","r":false,"t":"`$OBJECT`","key$":"meta"},"riverName":{"a":true,"h":"River Name","n":"riverName","r":false,"t":"`$STRING`","key$":"riverName"},"stationReference":{"a":true,"h":"Station Reference","n":"stationReference","r":false,"t":"`$STRING`","key$":"stationReference"},"town":{"a":true,"h":"Town","n":"town","r":false,"t":"`$STRING`","key$":"town"}},"id":{"field":"id","name":"id"},"name":"station","op":{"list":{"input":"data","name":"list","points":[{"a":true,"co":{"id":"GET /id/stations","source":"openapi3","version":2},"g":{"query":[{"a":true,"k":"query","n":"limit","or":"_limit","r":false,"t":"`$INTEGER`","index$":0},{"a":true,"k":"query","n":"offset","or":"_offset","r":false,"t":"`$INTEGER`","index$":1},{"a":true,"k":"query","n":"parameter","or":"parameter","r":false,"t":"`$STRING`","index$":2},{"a":true,"k":"query","n":"river_name","or":"riverName","r":false,"t":"`$STRING`","index$":3},{"a":true,"k":"query","n":"search","or":"search","r":false,"t":"`$STRING`","index$":4}]},"k":"http","m":"GET","o":"/id/stations","q":{},"r":{},"rs":{"kind":"json","media":"application/json"},"s":[{"lit":"id"},{"lit":"stations"}],"t":{"req":"`reqdata`","res":"`body.items`"},"index$":0}],"key$":"list"},"load":{"input":"data","name":"load","points":[{"a":true,"co":{"id":"GET /id/stations/{id}","source":"openapi3","version":2},"g":{"params":[{"a":true,"k":"param","n":"id","or":"id","r":true,"t":"`$STRING`","index$":0}]},"k":"http","m":"GET","o":"/id/stations/{id}","q":{"exist":["id"]},"r":{},"rs":{"kind":"json","media":"application/json"},"s":[{"lit":"id"},{"lit":"stations"},{"var":"id"}],"t":{"req":"`reqdata`","res":"`body.items`"},"index$":0}],"key$":"load"}},"relations":{"ancestors":[]},"key$":"station","name__orig":"station","Name":"Station","name_":"station","name-":"station","NAME":"STATION","index$":0}, {"active":true,"entity":"station","key$":"BasicStationFlow","kind":"basic","name":"BasicStationFlow","param":{},"step":[{"a":true,"d":{},"i":{},"m":{},"o":"list","s":[],"v":[{"apply":"ItemExists","def":{"ref":"station_ref01"}}]},{"a":true,"d":{},"i":{"ref":"station_ref01","srcdatavar":"station_ref01_data","suffix":"_dt0"},"m":{"id":"station01"},"o":"load","s":[],"v":[{"apply":"TextFieldMark","def":{"mark":"Mark01-station_ref01"}}]}]}, 'Station', {"GET /id/stations":{"protocol":"http","parameters":[{"name":"_limit","in":"query","schema":{"type":"integer","minimum":0},"description":"Maximum number of returned stations.","index$":0},{"name":"_offset","in":"query","schema":{"type":"integer","minimum":0},"index$":1},{"name":"search","in":"query","schema":{"type":"string"},"description":"Text contained in a station label.","index$":2},{"name":"parameter","in":"query","schema":{"type":"string"},"description":"Measurement parameter, for example level or flow.","index$":3},{"name":"riverName","in":"query","schema":{"type":"string"},"index$":4}]},"GET /id/stations/{id}":{"protocol":"http","parameters":[{"name":"id","in":"path","required":true,"schema":{"type":"string"},"description":"Station identifier returned in the final segment of @id.","index$":0}]}}, { strict: LIVE_STRICT, t })
    }
    const client = setup.client
    const struct = setup.struct

    const isempty = struct.isempty
    const select = struct.select

    let station_ref01_data = Object.values(setup.data.existing.station)[0] as any

    // LIST
    const station_ref01_ent = client.Station()
    const station_ref01_match: any = {}

    const station_ref01_list = (await station_ref01_ent.list(station_ref01_match)).map((e: any) => e.data())


    // LOAD
    const station_ref01_match_dt0: any = {}
    station_ref01_match_dt0.id = station_ref01_data.id
    const station_ref01_data_dt0 = (await station_ref01_ent.load(station_ref01_match_dt0)).data()
    assert(station_ref01_data_dt0.id === station_ref01_data.id)


  })
})



// main.kit.test.live.strict is true (the default is true): a live
// request that fails, or a live test missing an input it needs,
// fails the test.
// An account with no record for a test to read skips it either way.
const LIVE_STRICT = true

function basicSetup(extra?: any) {
  // TODO: fix test def options
  const options: any = {} // null

  // TODO: needs test utility to resolve path
  const entityDataFile =
    Path.resolve(__dirname, 
      '../../../../.sdk/test/entity/station/StationTestData.json')

  // TODO: file ready util needed?
  const entityDataSource = Fs.readFileSync(entityDataFile).toString('utf8')

  // TODO: need a xlang JSON parse utility in voxgig/struct with better error msgs
  const entityData = JSON.parse(entityDataSource)

  options.entity = entityData.existing

  let client = EaFloodSDK.test(options, extra)
  const struct = client.utility().struct
  const merge = struct.merge
  const transform = struct.transform

  let idmap = transform(
    ['station01','station02','station03'],
    {
      '`$PACK`': ['', {
        '`$KEY`': '`$COPY`',
        '`$VAL`': ['`$FORMAT`', 'upper', '`$COPY`']
      }]
    })

  const env = envOverride({
    'EA_FLOOD_TEST_STATION_ENTID': idmap,
    'EA_FLOOD_TEST_LIVE': 'FALSE',
    'EA_FLOOD_TEST_EXPLAIN': 'FALSE',
  })

  idmap = env['EA_FLOOD_TEST_STATION_ENTID']

  const live = 'TRUE' === env.EA_FLOOD_TEST_LIVE

  const transport = createLiveTransport()
  if (live) {
    const rawIds = process.env['EA_FLOOD_TEST_STATION_ENTID']
    idmap = rawIds && rawIds.trim() ? JSON.parse(rawIds) : {}
    if (!idmap || Array.isArray(idmap) || typeof idmap !== 'object') {
      throw new Error('Live ENTID must be a JSON object')
    }
    client = new EaFloodSDK(merge([
      // FIRST, so the generated fields below win: sdk-test-control.json's
      // test.client.options adds to the live client, it does not redirect it.
      liveClientOptions(),
      {
      },
      // 'extra || {}', not a bare 'extra': struct.merge returns UNDEFINED when the
      // last entry is undefined, and basicSetup is normally called with no
      // argument at all - so a bare 'extra' silently discarded the apikey
      // and server values above and handed the SDK undefined. Harmless
      // while there was nothing in that object; not harmless now.
      extra || {},
      { system: { fetch: transport.fetch } }
    ]))
  }

  const setup = {
    idmap,
    env,
    options,
    client,
    struct,
    data: entityData,
    explain: 'TRUE' === env.EA_FLOOD_TEST_EXPLAIN,
    live,
    transport,
    now: Date.now(),
  }

  return setup
}
  
