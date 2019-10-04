import axios from 'axios'
import mockCallHpos from 'mock-dnas/mockCallHpos'

export const MOCK_HPOS_CONNECTION = true || process.env.NODE_ENV === 'test'

const axiosConfig = {
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  }
}

export function hposCall (method = 'get', path) {
  if (MOCK_HPOS_CONNECTION) {
    return mockCallHpos(method, path)
  } else {
    const fullPath = process.env.REACT_APP_HPOS_URL + '/' + path
    switch (method) {
      case 'get':
        return params => axios.get(fullPath, params, axiosConfig)
      case 'post':
        return params => axios.post(fullPath, params, axiosConfig)
      default:
        throw new Error(`No case in hposCall for ${method} method`)
    }
  }
}

const HposInterface = {
  os: {
    settings: hposCall('get', 'os-update'),
    updateSettings: hposCall('post', 'os-update')
  }
}

export default HposInterface
