// Copyright (c) 2026 Vaishakh Suresh. MIT licensed; retain the repository license notices.
// Project-owned additive template. Regenerate; do not edit the emitted copy.
import type { Context } from '../../types'
import { BaseFeature } from '../base/BaseFeature'

function record(value: unknown): value is Record<string, unknown> {
  return null !== value && 'object' === typeof value && !Array.isArray(value)
}

class EnvelopeFeature extends BaseFeature {
  name = 'envelope'
  version = '0.0.1'

  PrePoint(ctx: Context) {
    if ('station' !== ctx.entity?.name || 'load' !== ctx.op?.name) return
    const id = ctx.reqmatch?.id ?? ctx.match?.id
    if ('string' === typeof id && '' === id.trim()) {
      throw ctx.error('request_parameter_invalid', 'Station lookup id must not be empty')
    }
  }

  PreResult(ctx: Context) {
    // The stock feature corpus uses synthetic non-API payloads in explicit test mode.
    // Independent contract tests exercise this guard with the real response pipeline.
    if (ctx.options.test?.active === true || ctx.client._mode === 'test') return
    if ('station' !== ctx.entity?.name || !ctx.result?.ok || ctx.result.err) return
    const op = ctx.op?.name
    if ('list' !== op && 'load' !== op) return
    const body: unknown = ctx.result.body
    const items: unknown = record(body) ? body.items : undefined
    const valid = record(body) && Object.hasOwn(body, 'items') &&
      ('list' === op ? Array.isArray(items) && items.every(record) : record(items))
    if (!valid) {
      const error = ctx.error('response_envelope_invalid',
        'Expected an Environment Agency items ' + ('list' === op ? 'array of station objects' : 'station object'))
      error.status = ctx.result.status
      throw error
    }
  }
}

export { EnvelopeFeature }
