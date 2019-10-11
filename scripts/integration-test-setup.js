const axios = require('axios')
const wait = require('waait')

const params = {
  id: '0',
  jsonrpc: '2.0',
  method: 'call',
  params: {
    instance_id: 'holofuel::agent-1-id',
    zome: 'transactions',
    function: 'list_pending',
    args: {}
  }
}

process.env.INTEGRATION_TESTS = true

async function waitForConductor (interval = 30000) {
  console.log('Waiting for conductor to boot up')

  let isUp = false
  while (!isUp) {
    try {
      console.log('Checking if conductor is up')
      const result = await axios.post('http://127.0.0.1:3300', params)
      if (result.data.error) {
        throw new Error(result.data.error.message)
      }
      isUp = true
    } catch (error) {
      console.log(error)
      console.log(`Pausing for ${Math.ceil(interval / 1000)} seconds`)
      console.log('')
      await wait(interval)
    }
  }
  return true
}

waitForConductor()
  .then(() => console.log('Conductor is up!'))
