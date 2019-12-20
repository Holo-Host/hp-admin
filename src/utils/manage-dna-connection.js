
let developmentMockDnaConnection = true

const setDevMockConnectionVar = ({ connectionToMockData }) => {
  developmentMockDnaConnection = connectionToMockData
  return developmentMockDnaConnection
}

module.exports = {
  setDevMockConnectionVar,
  developmentMockDnaConnection
}
