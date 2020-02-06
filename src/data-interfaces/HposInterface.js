import axios from 'axios'
import mockCallHpos from 'mock-dnas/mockCallHpos'
import { signPayload, hashString } from 'holochainClient'
import stringify from 'fast-json-stable-stringify'
import { omitBy, isUndefined } from 'lodash/fp'

const mockHposConnectionInDevelopment = true

export const MOCK_HPOS_CONNECTION = process.env.REACT_APP_INTEGRATION_TEST = 'true' || process.env.NODE_ENV === 'test'
  ? true
  : process.env.NODE_ENV === 'production'
    ? false
    : mockHposConnectionInDevelopment

const axiosConfig = {
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  }
}

export function hposCall ({ method = 'get', path, apiVersion = 'v1', headers: userHeaders = {} }) {
  if (MOCK_HPOS_CONNECTION) {
    return mockCallHpos(method, apiVersion, path)
  } else {
    return async params => {
      const fullPath = ((process.env.NODE_ENV === 'production') ? (window.location.protocol + '//' + window.location.hostname) : process.env.REACT_APP_HPOS_URL) + '/api/' + apiVersion + '/' + path
      const urlObj = new URL(fullPath)

      let bodyHash

      if (params) {
        bodyHash = await hashString(stringify(params))
      }

      const signature = await signPayload(method, urlObj.pathname, bodyHash)

      const headers = omitBy(isUndefined, {
        ...axiosConfig.headers,
        ...userHeaders,
        'X-Body-Hash': bodyHash,
        'X-Hpos-Admin-Signature': signature
      })

      let data

      switch (method) {
        case 'get':
          ({ data } = await axios.get(fullPath, { params, headers }))
          return data
        case 'post':
          ({ data } = await axios.post(fullPath, params, { headers }))
          return data
        case 'put':
          ({ data } = await axios.put(fullPath, params, { headers }))
          return data
        default:
          throw new Error(`No case in hposCall for ${method} method`)
      }
    }
  }
}

const presentHposStatus = (hposStatus) => {
  const { holo_nixpkgs: holoNixPkgs, zerotier } = hposStatus
  return {
    versionInfo: {
      availableVersion: holoNixPkgs.channel.rev,
      currentVersion: holoNixPkgs.current_system.rev
    },
    networkId: zerotier.publicIdentity,
    ports: {
      primaryPort: zerotier.config.settings.primaryPort
    }
  }
}

const presentHposSettings = (hposSettings) => {
  const { admin, holoportos = {}, name } = hposSettings
  return {
    hostPubKey: admin.public_key,
    hostName: admin.name,
    registrationEmail: admin.email,
    networkStatus: holoportos.network || 'test', // ie: 'live'
    sshAccess: holoportos.sshAccess || false,
    deviceName: name || 'My HoloPort'
  }
}

const HposInterface = {
  os: {
    // HOLOPORT_OS SETTINGS
    settings: async () => {
      const result = await hposCall({ method: 'get', path: 'config' })()
      return presentHposSettings(result)
    },

    updateSettings: async (hostPubKey, hostName, deviceName, sshAccess) => {
      const settingsResponse = await hposCall({ method: 'get', path: 'config' })()

      // Updating the config endpoint requires the hash of the current config to make sure nothing has changed.
      const headers = {
        'X-Hpos-Admin-CAS': await hashString(stringify(settingsResponse))
      }

      // settingsConfig must contain .admin.{email,public_key}, but may contain other arbitrary
      // data.  We must only update what we have authority over, and data supplied for.
      const settingsConfig = {
        ...settingsResponse
      }
      if (hostPubKey !== undefined) {
        settingsConfig.admin.public_key = hostPubKey
      }
      if (deviceName !== undefined) {
        settingsConfig.name = deviceName
      }
      if (sshAccess !== undefined) {
        settingsConfig.holoportos = {
          sshAccess: sshAccess
        }
      }

      await hposCall({ method: 'put', path: 'config', headers })(settingsConfig)
      // We don't assume the successful PUT /api/v1/config returns the current config
      return presentHposSettings(settingsConfig)
    },

    // HOLOPORT_OS STATUS
    status: async () => {
      const result = await hposCall({ method: 'get', path: 'status' })()
      return presentHposStatus(result)
    },

    updateVersion: async () => {
      const result = await hposCall({ method: 'post', path: 'upgrade' })()
      return presentHposStatus(result)
    }
  }
}

export default HposInterface
