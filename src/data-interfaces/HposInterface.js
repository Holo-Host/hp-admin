import axios from 'axios'
import mockCallHpos from 'mock-dnas/mockCallHpos'
import { signPayload, hashResponseBody } from 'holochainClient'
import { stringify } from 'querystring';
import { stringify as jsonStringify } from 'json-stable-stringify'

const preLocalHposImageIntegration = true // TODO: Once HPOS image is included in nix setup, this should be removed, and the value returned to false, once HPOS Image is nixified and located within repo.
const mockHposConnection = process.env.NODE_ENV !== 'production' && true // boolean to toggle hpos mock data reference while in dev context...
export const MOCK_HPOS_CONNECTION = process.env.REACT_APP_INTEGRATION_TEST
  ? preLocalHposImageIntegration
  : process.env.NODE_ENV === 'test'
    ? true
    : mockHposConnection

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

      const signature = await signPayload(method, urlObj.pathname, params)

      const headers = {
        ...axiosConfig.headers,
        ...userHeaders,
        'X-Hpos-Admin-Signature': signature,
        'X-Original-Body': jsonStringify(params)
      }

      let data

      switch (method) {
        case 'get':
          ({ data } = await axios.get(fullPath, { params, headers }))
          return data
        case 'post':
          ({ data } = await axios.post(fullPath, params, headers))
          return data
        case 'put':
          ({ data } = await axios.put(fullPath, params, headers))
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

      // updating the config endpoint requires a hashed version of the current config to make sure nothing has changed.
      const headers = {
        'x-hp-admin-cas': await hashResponseBody(settingsResponse)
      }

      const settingsConfig = {
        admin: {
          name: hostName,
          public_key: hostPubKey
        },
        holoportos: {
          sshAccess: sshAccess
        },
        name: deviceName
      }

      const result = await hposCall({ method: 'put', path: 'config', headers })(settingsConfig)
      return presentHposSettings(result)
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
