const startTestConductor = require('../startTestConductor.js')
const { providerShims, HAPP_STORE_DNA_INSTANCE, HHA_DNA_INSTANCE } = require('./provider-shims.js')
const happConfig = require('./happ-data.js')
const happConfigKeys = Object.keys(happConfig)

// promiseMap needs to be applied twice for each happ... currently it is only promisifying and sequencing the first zome call.
const promiseMap = async (array, fn) => {
  const resolvedArray = await array
  let promiseArray =[]
  for(i=0; i<resolvedArray.length; i++){
    let v = await fn(resolvedArray[i])
    promiseArray.push(v)
  }
  return promiseArray
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

    const registerProvider = new Promise((resolve) => resolve(providerShims.registerAsProvider()))
    const fillHappStore = () => promiseMap(happConfigKeys, happId => createAndRegister(happId))

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
