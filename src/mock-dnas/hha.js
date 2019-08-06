const happs = [
  {
    id: 'QmHHAHappEntryAddressHash1',
    happstoreHash: 'QmXxiimzfcSHYqHXV2z6WNopeiFnPBx9YKnHzPcq9o8VoT'
  },
  {
    id: 'QmHHAHappEntryAddressHash2',
    happstoreHash: 'QmXx7imYqHXV2z6WNopeiFnPBx9YKnHzPcq9o8VoTzfcSH'
  }
]

function presentHappForGetAllApps ({ id, happstoreHash }) {
  const details = JSON.stringify({
    Ok: {
      app_bundle: {
        happ_hash: happstoreHash
      }
    }
  })
  return {
    hash: id,
    details
  }
}

function presentHappForGetEnabledAppList ({ id, happstoreHash }) {
  return {
    address: id,
    entry: {
      happ_hash: happstoreHash
    }
  }
}

const hha = {
  host: {
    register_as_host: () => {
      const address = 'QmHHAHostRegistrationAddress'
      hha.host.is_registered_as_host = { links: [{ address }] }
      return address
    },
    is_registered_as_host: {
      links: []
    },
    get_all_apps: happs.map(presentHappForGetAllApps),
    get_enabled_app_list: [
      presentHappForGetEnabledAppList(happs[0])
    ]
  }
}

export default hha