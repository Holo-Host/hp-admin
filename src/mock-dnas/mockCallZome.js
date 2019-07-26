import mockData from './mockData'
import { isFunction } from 'lodash/fp'

export default function mockCallZome (instanceId, zome, zomeFunc) {
  return function (args) {
    const funcOrResult = mockData[instanceId][zome][zomeFunc]
    let result
    if (isFunction(funcOrResult)) {
      result = funcOrResult(args)
    } else {
      result = funcOrResult
    }
    return Promise.resolve(JSON.stringify({ Ok: result }))
  }
}
