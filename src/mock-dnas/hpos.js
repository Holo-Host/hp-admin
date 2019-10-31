const data = {
  get: {
    // Returns holo-config.json data with seed field filtered out.
    '/v1/config': {
      admin: {
        email: 'sam.rose@holo.host',
        name: 'Holo Naut',
        public_key: 'Tw7179WYi/zSRLRSb6DWgZf4dhw5+b0ACdlvAw3WYH8'
      },
      holoportos: {
        network: 'live',
        sshAccess: true
      },
      name: 'My HoloPort'
    },

    // Returns immutable HoloPort status data.
    '/v1/status': {
      holo_nixpkgs: {
        // latest (available) HoloPortOS version
        channel: {
          rev: 'b13891c28d78f1e916fdefb5edc1d386e4f533c8'
        },
        // currently installed HoloPortOS version
        current_system: {
          rev: '4707080a5cba68e8bc215e22ef1c8e7d8e70791b'
        }
      },
      zerotier: {
        address: '2f07044b7a',
        clock: 1571075895334,
        config: {
          physical: null,
          settings: {
            allowTcpFallbackRelay: true,
            portMappingEnabled: true,
            primaryPort: 9993,
            softwareUpdate: 'disable',
            softwareUpdateChannel: 'release'
          }
        },
        online: true,
        planetWorldId: 149604618,
        planetWorldTimestamp: 1567801551272,
        publicIdentity: '2f07044b7a:0:505688f5c97313e5c7e34547e49a6ac46a05746b2e3faad724103b8ed34a4b108e15d08051db09eedd53ed089b19a5bfae9b1afdb7a9c65ad6f8aa9d98e4f2f2',
        tcpFallbackActive: false,
        version: '1.2.12',
        versionBuild: 0,
        versionMajor: 1,
        versionMinor: 2,
        versionRev: 12
      }
    }
  },
  post: {
    '/v1/config': params => {
      data.get['/v1/config'] = { ...data.get['/v1/config'], ...params }
      return {
        ...data.get['/v1/config']
      }
    },

    // Forces HoloPortOS upgrade. - Returns Status Code ONLY (200 if OK/Successful, 400 if Bad Request, or 401 if Unauthorized).
    // TODO: Talk to HCen to see if hydra/hpos will return new Status Obj upon successful update.
    '/v1/upgrade': () => {
      console.log('Code 200: You have now updated your HPOS Version.')
      return {
        ...data.get['/v1/status']
      }
    }
  }
}

export default data
