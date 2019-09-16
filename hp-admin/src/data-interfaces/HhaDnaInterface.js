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
    get: async appId => {
      const hostedHapps = await createZomeCall('host/get_enabled_app_list')()
      const hostedHappIds = hostedHapps.map(({ address }) => address)
      return createZomeCall('provider/get_app_details')({ app_hash: appId })
        .then(happ => ({
          id: appId,
          happStoreId: happ.app_bundle.happ_hash,
          isEnabled: hostedHappIds.includes(appId)
        }))
    },
    enable: appId => createZomeCall('host/enable_app')({ app_hash: appId }),
    disable: appId => createZomeCall('host/disable_app')({ app_hash: appId }),
    all: async () => {
      const allHapps = await createZomeCall('host/get_all_apps')()
      const hostedHapps = await createZomeCall('host/get_enabled_app_list')()
      const hostedHappIds = hostedHapps.map(({ address }) => address)

      return allHapps.map(({ hash, details }) => {
        const { Ok: { app_bundle: { happ_hash: happStoreId } } } = JSON.parse(details)
        return {
          id: hash,
          happStoreId,
          isEnabled: hostedHappIds.includes(hash)
        }
      })
    }
  },

  hostPricing: {
    get: async () => {
      // we need an id to call get_service_log_details, and because we set all apps the same in add_service_log_details, it doesn't matter which app the id comes from
      const happs = await HhaDnaInterface.happs.all()
      if (isEmpty(happs)) throw new Error("Can't set Host Pricing: no happs available to host.")
      return createZomeCall('provider/get_service_log_details')({ app_hash: happs[0].id })
        .then(({ price_per_unit: pricePerUnit }) => ({
          pricePerUnit,
          units: UNITS.bandwidth
        }))
    },
    update: async (units, pricePerUnit) => {
      const happs = await HhaDnaInterface.happs.all()
      // set price_per_unit the same for all happs
      await Promise.all(happs, ({ id }) => createZomeCall('provider/add_service_log_details')({
        app_hash: id,
        max_fuel_per_invoice: 1,
        max_unpaid_value: 1,
        price_per_unit: pricePerUnit
      }))

      return {
        pricePerUnit,
        units
      }
    }
  }
}

export default HhaDnaInterface
