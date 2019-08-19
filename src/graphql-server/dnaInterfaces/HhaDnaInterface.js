import { isEmpty } from 'lodash/fp'
import { instanceCreateZomeCall } from '../holochainClient'
import { UNITS } from 'models/HostPricing'

export const INSTANCE_ID = 'hha' // holo-hosting-app
const createZomeCall = instanceCreateZomeCall(INSTANCE_ID)

const HhaDnaInterface = {
  currentUser: {
    create: async () => {
      const { hash } = await createZomeCall('whoami/get_user')()
      await createZomeCall('host/register_as_host')({ host_doc: { kyc_proof: 'this value is ignored by dna' } })
      return {
        id: hash,
        isRegistered: true
      }
    },
    get: async () => {
      const { hash } = await createZomeCall('whoami/get_user')()
      const { links } = await createZomeCall('host/is_registered_as_host')()
      let isRegistered = false
      if (links.length > 0) {
        isRegistered = true
      }
      return {
        id: hash,
        isRegistered
      }
    }
  },

  happs: {
    get: appId => createZomeCall('provider/get_app_details')({ app_hash: appId })
      .then(happ => ({
        id: appId,
        happStoreId: happ.app_bundle.happ_hash
      })),
    enable: appId => createZomeCall('host/enable_app')({ app_hash: appId }),
    disable: appId => createZomeCall('host/disable_app')({ app_hash: appId }),
    allAvailable: () => createZomeCall('host/get_all_apps')()
      .then(happListings => happListings.map(({ hash, details }) => {
        const { Ok: { app_bundle: { happ_hash: happStoreId } } } = JSON.parse(details)
        return {
        // The 'id' below is the hha-id (ie. the hash of the hApp entry into HHA).
          id: hash,
          happStoreId
        }
      })),
    allHosted: () => createZomeCall('host/get_enabled_app_list')()
      .then(hostedHapps => hostedHapps.map(({ address, entry: { happ_hash: happStoreId } }) => ({
        // The 'id' below is the hha-id (ie. the hash of the hApp entry into HHA).
        id: address,
        happStoreId,
        isEnabled: true
      })))
  },

  hostPricing: {
    get: async () => {
      // we need an id to call get_service_log_details, and because we set all apps the same in add_service_log_details, it doesn't matter which app the id comes from
      const allAvailable = await HhaDnaInterface.happs.allAvailable()
      if (isEmpty(allAvailable)) throw new Error("Can't set Host Pricing: no happs available to host.")
      return createZomeCall('provider/get_service_log_details')({ app_hash: allAvailable[0].id })
        .then(({ price_per_unit: pricePerUnit }) => ({
          pricePerUnit,
          units: UNITS.bandwidth
        }))
    },
    update: async (pricePerUnit) => {
      const allAvailable = await HhaDnaInterface.happs.allAvailable()
      // set price_per_unit the same for all happs
      await Promise.all(allAvailable, ({ id }) => createZomeCall('provider/add_service_log_details')({
        app_hash: id,
        max_fuel_per_invoice: 1,
        max_unpaid_value: 1,
        price_per_unit: pricePerUnit
      }))

      return {
        pricePerUnit,
        units: UNITS.bandwidth
      }
    }
  }
}

export default HhaDnaInterface
