const fs = require('fs')
const toml = require('toml')
const holochainZomeCall = require('../invoke-holochain-zome-call.js')
const happConfig = require('./happ-data.js')

// DNA Instance Identifiers :
const config = toml.parse(fs.readFileSync('./conductor-config.toml', 'utf-8'))
const HAPP_STORE_DNA_INSTANCE = config.instances.find(instance => instance.dna === 'happ-store').id
const HHA_DNA_INSTANCE = config.instances.find(instance => instance.dna === 'holo-hosting-app').id

const providerShims = {
  // 1. Register Provider in hha
  registerAsProvider: () => {
    return new Promise(resolve => {
      const regProviderCall = holochainZomeCall(
        HHA_DNA_INSTANCE,
        'provider',
        'register_as_provider',
        {
          provider_doc: {
            kyc_proof: 'TODO: This info is currently not required.'
          }
        }
      )
      resolve(regProviderCall)
    })
  },

  // 2. Create App in has
  createHapp: (happId) => {
    const happ = happConfig[happId]
    return holochainZomeCall(
      HAPP_STORE_DNA_INSTANCE,
      'happs',
      'create_app',
      {
        title: happ.title,
        description: happ.description,
        thumbnail_url: happ.thumbnail_url,
        homepage_url: happ.homepage_url,
        ui: happ.ui,
        dnas: happ.dna
      }
    )
  },

  // 3. Register App in hha
  registerHapp: (happStoreId, happId) => {
    const happ = happConfig[happId]
    return holochainZomeCall(
      HHA_DNA_INSTANCE,
      'provider',
      'register_app',
      {
        app_bundle: {
          happ_hash: happStoreId
        },
        domain_name: happ.domain
      }
    )
  },

  // Register Provider's HF account. > NB: currently adds dummy data
  addHolofuelAccount: () => holochainZomeCall(HHA_DNA_INSTANCE, 'provider', 'add_holofuel_account', { holofuel_account_details: { account_number: 'not currently used' } })
}

module.exports = {
  providerShims,
  HAPP_STORE_DNA_INSTANCE,
  HHA_DNA_INSTANCE
}
