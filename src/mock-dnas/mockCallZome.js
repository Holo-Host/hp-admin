import mockData from './mockData'
import { isFunction } from 'lodash/fp'
import wait from 'waait'

// this should be false on develop
const SIMULATE_DNA_LAG = false

export default function mockCallZome (instanceId, zome, zomeFunc) {
  return async function (args) {
    const funcOrResult = mockData[instanceId][zome][zomeFunc]
    const result = isFunction(funcOrResult) ? funcOrResult(args) : funcOrResult
    if (SIMULATE_DNA_LAG) {
      await wait(2000 + (3000 * Math.random()))
    }
    return JSON.stringify({ Ok: result })
  }
}
