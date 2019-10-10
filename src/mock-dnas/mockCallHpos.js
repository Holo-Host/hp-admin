import { isFunction } from 'lodash/fp'
import mockData from './hpos'

export default function mockHposCall (method = 'get', path) {
  return function (params) {
    const funcOrResult = mockData[method][path]
    const result = isFunction(funcOrResult) ? funcOrResult(params) : funcOrResult
    return Promise.resolve(result)
  }
}
