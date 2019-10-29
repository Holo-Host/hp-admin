import * as fs from 'fs'
import { exec } from 'child_process'

// Helper Functions:
export const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const deleteDirectoryRecursive = async (path) => {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(file => {
      const currentPath = path + '/' + file
      if (fs.lstatSync(currentPath).isDirectory()) {
        deleteDirectoryRecursive(currentPath)
      } else {
        fs.unlinkSync(currentPath)
      }
    })
    return fs.rmdirSync(path)
  }
}

export const runConductor = async (startScriptFn, testingFn) => {
  // TODO: how to shut down last run properly in case of failure?
  console.log('Deleting Storage Files...')
  // TODO: REMOVE TMP FILES (all DNA PERSISTED STORAGE)...
  await deleteDirectoryRecursive('../../tmp')

  exec('killall holochain')
  exec('nix-shell')
  console.log('Nix Shell started...')

  await startScriptFn(testingFn)
    .catch(e => console.error('Error : ', e))
    .finally(() => {
      console.log('Testing Scenario Closed.')
      console.log('Shutting down conductor...')
      exec('exit')
    })
  // Give envoy time to shut down (TODO, remove)
  await delay(1000)
}
