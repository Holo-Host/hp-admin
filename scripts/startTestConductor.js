const axios = require('axios')
const startTestConductor = (waiting = false) =>
  axios.post('http://localhost:3300/admin/agent/list', {})
    .then(result => {
      if (result.status !== 200 && result.data.error) throw new Error(result.data.error.message)
      else return result.status
    })
    .catch(e => {
      if (waiting) return { errCode: e.code, err: e }
      else throw new Error(` \n \n >>>>>>>>>>>>>>>>>>> NO HC Conductor Found. <<<<<<<<<<<<<<<  \n \n`)
    })

module.exports = startTestConductor
