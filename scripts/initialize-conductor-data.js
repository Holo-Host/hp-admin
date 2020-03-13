const util = require('util')
const ncp = util.promisify(require('ncp').ncp)
const { promiseMap, createAndRegister, happConfigKeys } = require('./prepareHpAdminData')
const { providerShims, HAPP_STORE_DNA_INSTANCE, HHA_DNA_INSTANCE } = require('./prepareHpAdminData/provider-shims.js')
require('dotenv').config()

function snapshotStrorage () {
  return ncp(process.env.REACT_APP_DEFAULT_STORAGE, process.env.REACT_APP_STORAGE_SNAPSHOT)
}

const populateHpAdminData = async () => {
  console.log('\n ************************************************************* ')
  console.log(' HAPP_STORE_DNA_INSTANCE : ', HAPP_STORE_DNA_INSTANCE)
  console.log(' HHA_DNA_INSTANCE : ', HHA_DNA_INSTANCE)
  console.log(' ************************************************************* \n')

  const registerProvider = new Promise((resolve) => resolve(providerShims.registerAsProvider()))
  const fillHappStore = () => promiseMap(happConfigKeys, happId => createAndRegister(happId))

  return registerProvider
    .then(_ => fillHappStore())
    .then(_ => providerShims.addHolofuelAccount())
    .catch(e => console.log('Error when registering Provider. >> ERROR : ', e))
}

populateHpAdminData()
  .then(() => console.log('Finished loading HPAdmin data...'))
  .then(() => snapshotStrorage())
  .then(() => console.log('Loaded Snapshot Storage'))
  .then(() => process.exit())
  .catch(e => {
    console.log('error', e)
    process.exit(-1)
  })
