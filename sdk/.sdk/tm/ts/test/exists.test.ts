
import { test, describe } from 'node:test'
import { equal } from 'node:assert'


import { EaFloodSDK } from '..'


describe('exists', async () => {

  test('test-mode', () => {
    const testsdk = EaFloodSDK.test()
    equal(testsdk instanceof EaFloodSDK, true,
      'EaFloodSDK.test() must return a client synchronously')
  })

})
