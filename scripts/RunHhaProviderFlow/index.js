// const startTestConductor = require('../startTestConductor.js')
const { providerShims } = require('./provider-shims.js') // { providerShims, HAPP_STORE_DNA_INSTANCE, HHA_DNA_INSTANCE }
const happConfig = require('./happ-data.js')
const happConfigKeys = Object.keys(happConfig)

const promiseMap = async (array, fn) => {
  const resolvedArray = await array
  const promiseArray = []
  for (let i = 0; i < resolvedArray.length; i++) {
    const promisifiedFnVector = await fn(resolvedArray[i])
    promiseArray.push(promisifiedFnVector)
  }
  return promiseArray
}

const createAndRegister = async (happId) => {
  const r = await providerShims.createHapp(happId)
  const { Ok: happStoreId } = JSON.parse(r)
  const registerResult = await providerShims.registerHapp(happStoreId, happId)
  return registerResult
}

// TODO: Wrap in a fn that determines if running initizialzie-conductor-data
//  >> if so, return null, if not, return this script
// startTestConductor()
//   .then(() => {
//     console.log('\n ************************************************************* ')
//     console.log(' HAPP_STORE_DNA_INSTANCE : ', HAPP_STORE_DNA_INSTANCE)
//     console.log(' HHA_DNA_INSTANCE : ', HHA_DNA_INSTANCE)
//     console.log(' ************************************************************* \n')

//     const registerProvider = new Promise((resolve) => resolve(providerShims.registerAsProvider()))
//     const fillHappStore = () => promiseMap(happConfigKeys, happId => createAndRegister(happId))

//     return registerProvider
//       .then(_ => fillHappStore())
//       .then(_ => providerShims.addHolofuelAccount())
//       .then(_ => process.exit())
//       .catch(e => console.log('Error when registering Provider. >> ERROR : ', e))
//   })

module.exports = {
  promiseMap,
  createAndRegister,
  happConfigKeys
}
