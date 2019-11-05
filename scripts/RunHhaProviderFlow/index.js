const startTestConductor = require('../startTestConductor.js')
const { providerShims, HAPP_STORE_DNA_INSTANCE, HHA_DNA_INSTANCE } = require('./provider-shims.js')
const happConfig = require('./happ-data.js')
const happConfigKeys = Object.keys(happConfig)

const promiseMap = async (array, fn) => {
  const resolvedArray = await array
  const promiseArray = resolvedArray.map(fn)
  const resolved = await Promise.all(promiseArray)
  return resolved
}

const createAndRegister = async (happId) => {
  const r = await providerShims.createHapp(happId)
  const { Ok: happStoreId } = JSON.parse(r)
  const registerResult = await providerShims.registerHapp(happStoreId, happId)
  return registerResult
}

startTestConductor()
  .then(() => {
    console.log('\n ************************************************************* ')
    console.log(' HAPP_STORE_DNA_INSTANCE : ', HAPP_STORE_DNA_INSTANCE)
    console.log(' HHA_DNA_INSTANCE : ', HHA_DNA_INSTANCE)
    console.log(' ************************************************************* \n')

    console.log('happConfigKeys ARRAY : ', happConfigKeys)

    const registerProvider = new Promise((resolve) => resolve(providerShims.registerAsProvider()))
    const fillHappStore = () => promiseMap(happConfigKeys, happId => createAndRegister(happId))

    // const fillHappStore = async () => {
    //   const outcome = await promiseMap(happConfigKeys, happId => createAndRegister(happId))
    //   console.log('outcome : ', outcome)
    //   return outcome
    // }

    return registerProvider
      .then(_ => fillHappStore())
      .then(_ => providerShims.addHolofuelAccount())
      .then(_ => process.exit())
      .catch(e => console.log('Error when registering Provider. >> ERROR : ', e))
  })

module.exports = {
  promiseMap,
  createAndRegister,
  happConfigKeys
}
