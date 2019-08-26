export const happs = [
  {
    id: 'QmHHAHappEntryAddressHash1',
    happstoreId: 'QmXxiimzfcSHYqHXV2z6WNopeiFnPBx9YKnHzPcq9o8VoT'
  },
  {
    id: 'QmHHAHappEntryAddressHash2',
    happstoreId: 'QmXx7imYqHXV2z6WNopeiFnPBx9YKnHzPcq9o8VoTzfcSH'
  }
]

export const hostingUserId = 'HcUserAgentId'

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
    register_as_host: () => 'QmHHAHostRegistrationAddress',
    is_registered_as_host: {
      links: []
    },
    enable_app: appId => appId,
    disable_app: appId => appId,
    get_all_apps: happs.map(presentHappForGetAllApps),
    get_enabled_app_list: [
      presentHappForGetEnabledAppList(happs[0])
    ]
  },
  provider: {
    get_app_details: ({ app_hash: appHash }) => {
      const happ = happs.find(h => h.id === appHash)
      return presentHappForGetAppDetails(happ)
    },
    get_service_log_details: {
      price_per_unit: '5'
    },
    add_service_log_details: details => details
  },
  whoami: {
    get_user: {
      hash: hostingUserId
    }
  }
}

export default hha
