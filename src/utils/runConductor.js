import { exec } from 'child_process' // execFile,
// import * as rimraf from 'rimraf'
// import wait from 'waait'

export const defaultStorage = process.env.REACT_APP_STORAGE_PATH

export const runConductor = async (testingFn) => {
  // NB: REMOVE all DNA PERSISTED STORAGE FILES...
  // rimraf.sync(defaultStorage)
  console.log('Deleted Existing Storage Files...')

  await exec('holochain -c conductor-config.toml &> conductor.log &')
  await exec('npm run waiting')
  // await exec('node scripts/wait-for-conductor.js')

  console.log('Started...')

  testingFn()
    .catch(e => console.error('Error : ', e))
    .finally(() => {
      // console.log('Testing Scenario closed.')
      // console.log('Shutting down your Conductor...')
      // TODO : WRITE CONDUCTOR SHUT DOWN PROCESS
    })

  // await exec("nix-shell --run 'node scripts/wait-for-conductor.js'")
  // console.log('Started Nix Shell...')
  // await wait(10000)
  // exec('exit')
}
