const axios = require('axios')
const startTestConductor = async (waiting = false) => {
  return new Promise(resolve => {
    const callToHC = axios.post('http://localhost:3300/admin/agent/list', {})
    resolve(callToHC)
  })
    .then(result => {
      if (result.status !== 200 && result.data.error) throw new Error(result.data.error.message)
      else return result.status
    })
    .catch(e => {
      if (waiting) return { errCode: e.code, err: e }
      else throw new Error(` \n \n >>>>>>>>>>>>>>>>>>> NO HC Conductor Found. <<<<<<<<<<<<<<<  \n \n`)
    })
}

module.exports = startTestConductor
