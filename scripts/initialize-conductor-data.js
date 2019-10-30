const createZomeCall = require('./create-zome-call')

createZomeCall('holofuel', 'transactions', 'whoami')
  .then(zomeCall => zomeCall())
  .then(result => {
    console.log('result of zome call', result)
  })
