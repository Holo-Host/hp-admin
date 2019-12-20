const fs = require('fs')
const path = require('path')

const manageDnaConnectionFile = path.join(__dirname, '../src/utils/manage-dna-connection.js')
const LIVE_CONNECTION_VALUE = false

const fileContent = `
let developmentMockDnaConnection = ${LIVE_CONNECTION_VALUE}

const setDevMockConnectionVar = ({ connectionToMockData }) => {
  developmentMockDnaConnection = connectionToMockData
  return developmentMockDnaConnection
}

module.exports = {
  setDevMockConnectionVar,
  developmentMockDnaConnection
}
`

const writeConncectionFile = () => new Promise(resolve => {
  fs.writeFile(manageDnaConnectionFile, fileContent, err => {
    if (err) throw err
    resolve(console.log('\n Data is written to file successfully. '))
  })
})

writeConncectionFile()
  .then(() => console.log(` You are now connected to LIVE Data !! \n`))
