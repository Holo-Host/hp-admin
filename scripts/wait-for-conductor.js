const axios = require('axios')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const wait = require('waait')

const reattemptConnection = async (firstError = '') => {
  console.log('Stopping Conductor...')
  return exec('npm run hc:stop')
    .then(async () => {
      console.log('Restarting Conductor...')
      return exec('npm run hc:start-and-wait')
        .catch(e => { console.log('hc:start-and-wait error : ', e) })
    })
    .catch(e => {
      console.log('hc:stop error: ', e)
      console.log('Error connecting to Holochain Conductor', firstError)
      throw firstError
    })
}

async function waitForConductor (interval = 10000) {
  console.log('Waiting for conductor to boot up')
  let isUp = false

  while (!isUp) {
    try {
      console.log('Checking if conductor is up')
      // Verify that conductor is up && the dna instance is live
      // const agent1 = getAgent(0)
      const agentId = process.env.REACT_APP_AGENT_ID
      const result = await axios.post(`http://localhost:3300/${agentId}::<happ_id>-holofuel/profile/get_my_profile`, {})
      if (result.status !== 200 && result.data.error) throw new Error(result.data.error.message)
      else if (result.status === 200) isUp = true
      else return result.status
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`Pausing for ${Math.ceil(interval / 1000)} seconds`)
        console.log('')
        return wait(interval)
      } else {
        console.log('>>>>>> CALL TO CONDUCTOR DID NOT PASS :: error code : ', error.code)
        await reattemptConnection(error)
      }
    }
  }
  return true
}

waitForConductor()
  .then(() => { console.log('Conductor is up!'); return true })
