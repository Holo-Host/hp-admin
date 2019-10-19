import axios from 'axios'
import mockCallHpos from 'mock-dnas/mockCallHpos'

export const MOCK_HPOS_CONNECTION = true || process.env.NODE_ENV === 'test'

const axiosConfig = {
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  }
}

export function hposCall (method = 'get', apiVersion = 'v1', path) {
  if (MOCK_HPOS_CONNECTION) {
    return mockCallHpos(method, apiVersion, path)
  } else {
    const fullPath = process.env.REACT_APP_HPOS_URL + '/' + apiVersion + '/' + path
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
    // HOLOPORT_OS SETTINGS
    settings: hposCall('get', 'config'),
    updateSettings: async (hposSettings) => {
      const settingsConfig = {
        admin: {
          name: hposSettings.hostName,
          public_key: hposSettings.hostPubKey
        },
        holoportos: {
          sshAccess: hposSettings.sshAccess
        }
      }

      const result = await hposCall('post', 'config')(settingsConfig)
      console.log('HPOST INTERFACEUPDATE SETTINGS (POST) result: ', result)
      return result
    },
    // HOLOPORT_OS STATUS
    status: hposCall('get', 'status'),
    updateVersion: async (hposVersion) => {
      const holoNixVersions = {
        channel: {
          rev: hposVersion.availableVersion
        },
        current_system: {
          rev: hposVersion.currentVersion
        }
      }

      const result = await hposCall('post', 'upgrade')(holoNixVersions)
      console.log('HPOS INTERFACE UPDATE VERSION (POST) result: ', result)
      return result
    }
  }
}

export default HposInterface
