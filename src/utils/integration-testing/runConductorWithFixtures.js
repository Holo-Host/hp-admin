const fs = require('fs')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const rimraf = require('rimraf')
const wait = require('waait')

export default function runConductorWithFixtures (testFn) {
  return async function () {
    console.log('1')
    await exec('npm run hc:stop')
      // TODO: ADD BACK THE ERROR REFERENCE BEFORE PUSHING UP!!
      // .catch(e => console.log('hc:stop error: ', e))
      .catch(e => console.log('hc:stop error'))

    await wait(5000)

    console.log('2')
    fs.access(process.env.REACT_APP_DEFAULT_STORAGE, fs.constants.F_OK, async (e) => {
      if (e) {
        console.error('Error locating Default Storage dir')
        console.log('Defaulting to auto generated Storage dir. \n')
        console.log('Skipping 3 & 4... \n')
      } else {
        rimraf(process.env.REACT_APP_DEFAULT_STORAGE, async (e) => {
          if (e) {
            console.error(e)
            throw new Error('Error deleting residual Default Storage dir: ')
          } else {
            fs.access(process.env.REACT_APP_STORAGE_SNAPSHOT, fs.constants.F_OK, async (e) => {
              if (e) {
                console.log('Error locating Storage Snapshot dir : ', e)
                console.log('\nDefaulting to auto generated Storage dir. \n')
                console.log('Skipping 3 & 4... \n')
              } else {
                console.log('Deleted residual Default Storage dir.')
                console.log('3')
                // eslint-disable-next-line no-unused-vars
                const { _, stderr } = await exec(`cp -r --remove-destination ${process.env.REACT_APP_STORAGE_SNAPSHOT} ${process.env.REACT_APP_DEFAULT_STORAGE}`)
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
      }
    })

    const hcStart = async () => exec('holochain -c ./conductor-config.toml &> conductor.log &')
    hcStart()

    const waitConductor = async () => {
      // eslint-disable-next-line no-unused-vars
      const { _, stderr } = await exec('npm run test:wait-for-conductor')
      if (stderr) console.error('wait-for-conductor error:', stderr)
    }

    return waitConductor()
      .then(() => {
        console.log('Conductor is up...')
        console.log('5')
        return testFn()
          .catch(async (e) => {
            await exec('npm run hc:stop')
              .then(() => console.log('Conductor Shut Down...'))
              .catch()
            console.error('Jest Test Error: ', e)
            throw new Error('Test Failed')
          })
      })
      .then(async () => {
        console.log('Scenario Test Complete')
        await exec('npm run hc:stop')
          .then(() => console.log('Conductor Successfully Closed.'))
          .catch()
      })
  }
}
