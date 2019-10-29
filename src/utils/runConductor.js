import { exec } from 'child_process'
// import execFile from 'child_process'
import * as rimraf from 'rimraf'
import wait from 'waait'

export const defaultStorage = process.env.REACT_APP_STORAGE_PATH
// export const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export const runConductor = async (testingFn) => {
  // NB: REMOVE all DNA PERSISTED STORAGE FILES...
  if (defaultStorage) {
    console.log('Located Storage Files...')
    rimraf.sync(defaultStorage)
    console.log('Deleted Storage Files...')
  }

  await exec("nix-shell --run 'node scripts/wait-for-conductor.js'", (err, out, code) => {
    if (err instanceof Error) throw err
    console.log('INSIDE OF THE EXEC COMMAND')

    process.stderr.write(err)
    process.stdout.write(out)
    process.exit(code)
  })
  // await exec("nix-shell --run 'node scripts/wait-for-conductor.js'")
  console.log('Started Nix Shell...')

  testingFn()
    .then(_ => console.log('inside then...'))
    .catch(e => console.error('Error : ', e))
    .finally(() => {
      console.log('Testing Scenario closed.')
      console.log('Shutting down your Conductor...')
      exec('exit')
    })
  await wait(1000)
}
