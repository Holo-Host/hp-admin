import axios from 'axios'
import mockCallHpos from 'mock-dnas/mockCallHpos'

const preLocalHposImageIntegration = true // TODO: Once HPOS image is included in nix setup, this should be removed, and the value retunred to false, once HPOS Image is nixified and located within repo.
const developmentMockHposConnection = true // boolean to toggle hpos mock data reference while in dev context...
export const MOCK_HPOS_CONNECTION = process.env.REACT_APP_INTEGRATION_TEST
  ? preLocalHposImageIntegration
  : process.env.NODE_ENV === 'test'
    ? true
    : developmentMockHposConnection

const axiosConfig = {
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  }
}

export function hposCall (method = 'get', path, authToken, apiVersion = 'v1') {
  if (MOCK_HPOS_CONNECTION) {
    return mockCallHpos(method, apiVersion, path)
  } else {
    const fullPath = process.env.REACT_APP_HPOS_URL + '/' + apiVersion + '/' + path

    const headers = {
      ...axiosConfig.headers,
      'X-Holo-Admin-Signature': authToken
    }

    switch (method) {
      case 'get':
        return async params => {
          const { data } = await axios.get(fullPath, { params, headers })
          return data
        }
      case 'post':
        return async params => {
          const { data } = await axios.post(fullPath, { params, headers })
          return data
        }
      default:
        throw new Error(`No case in hposCall for ${method} method`)
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
  const { admin, holoportos, name } = hposSettings
  return {
    hostPubKey: admin.public_key,
    hostName: admin.name,
    registrationEmail: admin.email,
    networkStatus: holoportos.network, // ie: 'live'
    sshAccess: holoportos.sshAccess,
    deviceName: name
  }
}

const HposInterface = {
  os: {
    // HOLOPORT_OS SETTINGS
    settings: async (authToken) => {
      const result = await hposCall('get', 'config', authToken)()
      return presentHposSettings(result)
    },

    // TODO: Disucss options and implications for updating a Host's registration email.
    updateSettings: async (hostPubKey, hostName, sshAccess, authToken) => {
      const settingsConfig = {
        admin: {
          name: hostName,
          public_key: hostPubKey
        },
        holoportos: {
          sshAccess: sshAccess
        }
      }

      const result = await hposCall('post', 'config', authToken)(settingsConfig)
      return presentHposSettings(result)
    },

    // HOLOPORT_OS STATUS
    status: async (authToken) => {
      const result = await hposCall('get', 'status', authToken)()
      return presentHposStatus(result)
    },

    updateVersion: async (authToken) => {
      const result = await hposCall('post', 'upgrade', authToken)()
      return presentHposStatus(result)
    }
  }
}

export default HposInterface
