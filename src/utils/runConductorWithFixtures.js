// import { exec } from 'child_process'
const fs = require('fs')
// const fsPromises = fs.promises
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const rimraf = require('rimraf')

export default function runConductorWithFixtures (testFn) {
  return async function () {
    console.log('1')
    await exec('npm run hc:stop')
      // TODO: ADD BACK THE ERROR REFERENCE BEFORE PUSHING UP!!
      // .catch(e => console.log('hc:stop error: ', e))
      .catch(e => console.log('hc:stop error: NO HOLOCHAIN PROCESS EXISTS'))

    console.log('2')
    fs.access(process.env.REACT_APP_STORAGE_SNAPSHOT, fs.constants.F_OK, e => {
      if (e) console.log('Defaulting to residual Default Storage dir. \n Error locating Storage Snapshot dir : ', e)
      else {
        rimraf(process.env.REACT_APP_DEFAULT_STORAGE, async (e) => {
          if (e) {
            console.error(e)
            throw new Error('Error deleting residual Default Storage dir: ')
          } else {
            console.log('Deleted residual Default Storage dir.')
            console.log('3')
            const { stderr } = await exec(`cp -rf ${process.env.REACT_APP_STORAGE_SNAPSHOT} ${process.env.REACT_APP_DEFAULT_STORAGE}`)
            if (stderr) {
              console.error(e)
              throw new Error('Error coping Snapshot Storage dir into Default Storage dir: ')
            } else {
              console.log('Copied Snapshot Storage into Default Storage!')
              console.log('4')
            }
          }
        })
      }
    })

    const hcStart = async () => {
      const { stderr } = await exec('npm run hc:start &')
      if (stderr) {
        console.log('hc:start error')
        console.log('\n******************************************************')
        console.log('\n!! Recommendation: Stop and restart your conductor !!\n')
        console.log('******************************************************\n')
        throw console.error(stderr)
      }
    }
    hcStart()

    const waitConductor = async () => {
      const { stderr } = await exec('npm run test:wait-for-conductor')
      if (stderr) console.error('wait-for-conductor error:', stderr)
    }

    return waitConductor()
      .then(() => {
        console.log('Conductor is up...')
        console.log('5')
        return testFn()
          .catch(e => { throw console.error(e) })
      })
      .then(async () => {
        console.log('Scenario Test Complete')
        await exec('npm run hc:stop')
          .then(() => console.log('Conductor Successfully Closed.'))
          .catch(e => console.log('hc:stop error: NO HOLOCHAIN PROCESS EXISTS'))
      })
  }
}
