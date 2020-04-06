const fs = require('fs')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const rimraf = require('rimraf')
const wait = require('waait')
const ncp = util.promisify(require('ncp').ncp)

export default function runConductorWithFixtures (testFn) {
  return async function () {
    console.log('Creating Testing Environment...')
    await exec('npm run hc:stop')
      .catch(e => {
        // If e.code === 1, error results from no holochain processes being found
        if (e.code === 1) return null
        else console.error('hc:stop error: ', e.stderr)
      })

    await wait(5000)

    const manageStorageFiles = async () => {
      return new Promise(resolve => {
        console.log('Searching for Data Storage Files...')
        let storageDir
        fs.access(process.env.REACT_APP_DEFAULT_STORAGE, fs.constants.F_OK, async (e) => {
          if (e) {
            console.error('Error locating Default Storage dir')
            console.log('Defaulting to Nix Auto-Generated Storage Directory. \n')
            storageDir = 'Nix Auto-Generated Storage Directory'
            resolve(storageDir)
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
                    console.log('\nDefaulting to a New Nix Auto-Generated Storage Directory. \n')
                    storageDir = 'New Nix Auto-Generated Storage Directory'
                    resolve(storageDir)
                  } else {
                    console.log('Deleted residual Default Storage dir.')
                    await exec(`rm -rf ${process.env.REACT_APP_DEFAULT_STORAGE}`)
                    await exec(`mkdir ${process.env.REACT_APP_DEFAULT_STORAGE}`)
                    await ncp(process.env.REACT_APP_DEFAULT_STORAGE, process.env.REACT_APP_STORAGE_SNAPSHOT, e => { throw new Error('Error coping Snapshot Storage dir into Default Storage dir: ') })
                    console.log('Copied Snapshot Storage into Default Storage!')
                    storageDir = 'Snapshot Storage Directory'
                    resolve(storageDir)
                  }
                })
              }
            })
          }
        })
      })
    }
    await manageStorageFiles()

    // hc:start
    exec('holochain -c ./conductor-config.toml &> conductor.log &')

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
            console.log('Jest Test Error: ', e)
            await exec('npm run hc:stop')
              .then(() => console.log('Conductor Shut Down...'))
              .catch(e => null)
            throw new Error('End of Test: Scenario Test Failed')
          })
      })
      .then(async () => {
        console.log('End of Test: Scenario Test Successful')
        await exec('npm run hc:stop')
          .then(() => console.log('Conductor Successfully Closed.'))
          .catch(e => null)
      })
  }
}
