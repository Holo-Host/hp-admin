const createZomeCall = require('./create-zome-call')
const { getAgent } = require('../src/utils/conductorConfig')

async function populateData () {
  const zomeCall = await createZomeCall('holofuel', 'transactions', 'whoami')
  const result = await zomeCall()
  console.log('result of zome call', result)
}

populateData()
