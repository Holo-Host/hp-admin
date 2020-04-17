const axios = require('axios')
const wait = require('waait')
const { httpPort } = require('./read-test-conductor')

async function waitForConductor (interval = 10000) {
  if (!httpPort) throw new Error('No http interface port specificed in test conductor')

  console.log('Waiting for conductor to boot up')
  let isUp = false

  while (!isUp) {
    try {
      console.log('Checking if conductor is up')
      // Verify that conductor is up && the dna instance is live
      const result = await axios.post(`http://localhost:${httpPort}/`, {
        jsonrpc: '2.0',
        id: '0',
        method: 'admin/instance/running'
      })

      if (result.status === 200) {
        isUp = true
      } else {
        if (result.data.error) {
          throw new Error(result.data.error.message)
        } else {
          throw new Error(`Connection to conductor returned with status ${result.status}`)
        }
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`Pausing for ${Math.ceil(interval / 1000)} seconds`)
        console.log('')
        await wait(interval)
      } else {
        console.log('Error calling conductor :: error code : ', error.code)
      }
    }
  }
}

waitForConductor()
  .then(() => { console.log('Conductor is up!'); return true })
