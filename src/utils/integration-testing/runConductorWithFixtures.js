const fs = require('fs')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const rimraf = require('rimraf')
const wait = require('waait')

export default function runConductorWithFixtures (testFn) {
  return async function () {
    console.log('Creating Testing Environment...')
    await exec('npm run hc:stop')
      .catch(e => {
        if (e.code === 1) console.error('Cannot close holochain process : No holochain process currently running. Code:', e.code)
        else console.error('hc:stop error: ', e.stderr)
      })

    await wait(5000)

    const manageStorageFiles = () => {
      console.log('Searching for Data Storage Files...')
      return fs.access(process.env.REACT_APP_DEFAULT_STORAGE, fs.constants.F_OK, async (e) => {
        if (e) {
          console.error('Error locating Default Storage dir')
          console.log('Defaulting to auto generated Storage dir. \n')
        } else {
          rimraf(process.env.REACT_APP_DEFAULT_STORAGE, async (e) => {
            if (e) {
              console.error(e)
              throw new Error('Error deleting residual Default Storage dir: ')
            } else {
              fs.access(process.env.REACT_APP_STORAGE_SNAPSHOT, fs.constants.F_OK, async (e) => {
                if (e) {
                  if (e.code === 'ENOENT') console.error('Error locating Storage Snapshot dir : ENOENT: no such file or directory')
                  else console.error('Error locating Storage Snapshot dir : ', e)
                  console.log('\nDefaulting to auto generated Storage dir. \n')
                } else {
                  console.log('Deleted residual Default Storage dir.')
                  // eslint-disable-next-line no-unused-vars
                  const { _, stderr } = await exec(`cp -r --remove-destination ${process.env.REACT_APP_STORAGE_SNAPSHOT} ${process.env.REACT_APP_DEFAULT_STORAGE}`)
                  if (stderr) {
                    console.error(e)
                    throw new Error('Error coping Snapshot Storage dir into Default Storage dir: ')
                  } else {
                    console.log('Copied Snapshot Storage into Default Storage!')
                  }
                }
              })
            }
          })
        }
      })
    }
    manageStorageFiles()

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
        return testFn()
          .catch(async (e) => {
            await exec('npm run hc:stop')
              .then(() => console.log('Conductor Shut Down...'))
              .catch()
            console.error('Jest Test Error: ', e)
            throw new Error('End of Test: Scenario Test Failed')
          })
      })
      .then(async () => {
        console.log('End of Test: Scenario Test Successful')
        await exec('npm run hc:stop')
          .then(() => console.log('Conductor Successfully Closed.'))
          .catch()
      })
  }
}
