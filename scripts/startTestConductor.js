const axios = require('axios')
const startTestConductor = async () => {
  return new Promise(resolve => {
    const callToHC = axios.post('http://localhost:3300/admin/agent/list', {})
    resolve(callToHC)
  })
    .catch(e => { throw new Error(` \n \n >>>>>>>>>>>>>>>>>>> NO HC Conductor Found. <<<<<<<<<<<<<<< \n >>>>>>>>> NOTE: Make sure your HC conductor is running! <<<<<<<<< \n \n`) })
}

module.exports = startTestConductor
