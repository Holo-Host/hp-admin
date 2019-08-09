let happs = [
  {
    id: 'QmHHAHappEntryAddressHash1',
    happstoreId: 'QmXxiimzfcSHYqHXV2z6WNopeiFnPBx9YKnHzPcq9o8VoT'
  },
  {
    id: 'QmHHAHappEntryAddressHash2',
    happstoreId: 'QmXx7imYqHXV2z6WNopeiFnPBx9YKnHzPcq9o8VoTzfcSH'
  }
]

function presentHappForGetAllApps ({ id, happstoreId }) {
  const details = JSON.stringify({
    Ok: {
      app_bundle: {
        happ_hash: happstoreId
      }
    }
  })
  return {
    hash: id,
    details
  }
}

function presentHappForGetEnabledAppList ({ id, happstoreId }) {
  return {
    address: id,
    entry: {
      happ_hash: happstoreId
    }
  }
}

function presentHappForGetAppDetails ({ happstoreId }) {
  return {
    app_bundle: {
      happ_hash: happstoreId
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
    ],
    enable_app: happ => {
      happs = {
        ...happs,
        ...happ
      }
      const newHapp = presentHappForGetEnabledAppList(happ)
      hha.host.get_enabled_app_list = {
        ...hha.host.get_enabled_app_list,
        newHapp
      }
      return hha.host.get_enabled_app_list
    },
    disable_app: happ => {
      const newEnabledAppList = hha.host.get_enabled_app_list.filter(happ => happ.entry.happ_hash === happ)
      hha.host.get_enabled_app_list = newEnabledAppList
      return hha.host.get_enabled_app_list
    }
  },
  provider: {
    get_app_details: ({ app_hash: appHash }) => {
      const happ = happs.find(h => h.id === appHash)
      return presentHappForGetAppDetails(happ)
    }
  }
}

export default hha
