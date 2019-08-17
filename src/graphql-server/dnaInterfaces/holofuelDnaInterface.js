import { instanceCreateZomeCall } from '../holochainClient'

export const INSTANCE_ID = 'holofuel'
const createZomeCall = instanceCreateZomeCall(INSTANCE_ID)

// TODO : Finish Mocking below :
const HoloFuelDnaInterface = {
  transactions: {
    balance: async () => {
      const { hash } = await createZomeCall('get_ledger/balance')()
      await createZomeCall('host/register_as_host')({ host_doc: { kyc_proof: 'this value is ignored by dna' } })
      return {
        id: hash,
        isRegistered: true
      }
    }
  }
}

export default HoloFuelDnaInterface
