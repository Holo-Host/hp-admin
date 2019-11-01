// import { exec } from 'child_process'
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const ncp = util.promisify(require('ncp').ncp)
const rimraf = require('rimraf')

// const axios = require('axios')
// const wait = require('waait')

export default function runConductorWithFixtures (testFn) {
  return async function () {
    console.log('1')
    await exec('npm run hc:stop')
      .catch(e => console.log('hc:stop error: NO HOLOCHAIN PROCESS EXISTS')) // console.log('hc:stop error: ', e)

    console.log('2')
    rimraf.sync(process.env.REACT_APP_DEFAULT_STORAGE)

    console.log('3')
    await ncp(process.env.REACT_APP_STORAGE_SNAPSHOT, process.env.REACT_APP_DEFAULT_STORAGE)

    console.log('4')
    const hcStart = async () => {
      const { stderr } = await exec('npm run hc:start &')
      if (stderr) throw new Error('stderr:', stderr)
    }
    hcStart()

    const waitConductor = async () => {
      const { stdout, stderr } = await exec('npm run test:wait-for-conductor')
      console.log('stdout:', stdout)
      if (stderr) console.error('stderr:', stderr)
    }

    return waitConductor()
      .then(() => {
        // console.log('Conductor is up!')
        console.log('5')
        return testFn()
      })
      .catch(e => console.log('test:wait-for-conductor wrapper error ; ', e))

    // todo: test took 123 long to start conductor ...
  }
}

// *************************************
// TESTING OUT CALL TO WAIT-FOR-CONDUCTOR :

// const params = {
//   id: '0',
//   jsonrpc: '2.0',
//   method: 'call',
//   params: {
//     instance_id: 'HcScJyCCFZ83Mgt74vxzU5fabdtw8vcmbc7nkkY9HNabig36PUinfDzjebbu54r::<happ_id>-holofuel',
//     zome: 'transactions',
//     function: 'list_pending',
//     args: {}
//   }
// }

// async function waitForConductor (interval = 10000) {
//   console.log('Waiting for conductor to boot up')

//   let isUp = false
//   while (!isUp) {
//     try {
//       console.log('Checking if conductor is up')
//       const result = await axios.post('http://127.0.0.1:3300', params)
//       if (result.data.error) {
//         throw new Error(result.data.error.message)
//       }
//       console.log('AXIOS CALL RESULT : ', result)
//       isUp = true
//     } catch (error) {
//       if (error.code === 'ECONNREFUSED') {
//         console.log(`Pausing for ${Math.ceil(interval / 1000)} seconds`)
//         console.log('')
//         await wait(interval)
//       } else {
//         throw error
//       }
//     }
//   }
//   return true
// }
