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

const presentHposStatus = (hposStatus) => {
  const { holo_nixpkgs: holoNixPkgs, zerotier } = hposStatus
  return {
    versionInfo: {
      availableVersion: holoNixPkgs.channel,
      currentVersion: holoNixPkgs.current_system
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
    settings: hposCall('get', 'config'),

    // TODO: Disucss options and implications for updating a Host's registration email.
    updateSettings: async (hostPubKey, hostName, sshAccess) => {
      const settingsConfig = {
        admin: {
          name: hostName,
          public_key: hostPubKey
        },
        holoportos: {
          sshAccess: sshAccess
        }
      }

      const result = await hposCall('post', 'config')(settingsConfig)
      console.log('HPOS INTERFACE >>>> UPDATE SETTINGS (POST) result: ', result)
      const newHposSettings = presentHposSettings(result)
      console.log('HPOS INTERFACE >>>>>> hposSettings: ', newHposSettings)

      return newHposSettings
    },

    // HOLOPORT_OS STATUS
    status: hposCall('get', 'status'),

    updateVersion: async (availableVersion, currentVersion) => {
      const holoNixVersions = {
        channel: {
          rev: availableVersion
        },
        current_system: {
          rev: currentVersion
        }
      }

      const result = await hposCall('post', 'upgrade')(holoNixVersions)
      console.log('HPOS INTERFACE UPDATE VERSION (POST) result: ', result)
      const newHposStatus = presentHposStatus(result)
      console.log('HPOS INTERFACE >>>>>> hposStatus: ', newHposStatus)

      return newHposStatus
    }
  }
}

export default HposInterface
