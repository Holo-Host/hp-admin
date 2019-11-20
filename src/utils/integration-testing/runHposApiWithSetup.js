const wait = require('waait')

// TODO : Add interaction with HPOS API once included in nix setup
export default function runHposApiWithSetup (testFn) {
  return async function () {
    console.log('This is a placeholder Wrapper for the HPOS API Test Harness...')
    wait(0)
    return testFn()
      .then(() => console.log('Scenario Test Complete'))
      .catch(async (e) => {
        console.error('Jest Test Error: ', e)
        throw new Error('!! Test Failed !!')
      })
  }
}
