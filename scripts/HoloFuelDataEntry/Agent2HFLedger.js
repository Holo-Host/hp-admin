const moment = require('moment')
const namor = require('namor')

function amount () {
  return namor.generate({ numbers: 8 }).split('-')[2]
}
function notes () {
  return namor.generate({ words: 4, numbers: 0, char: ' ' })
}
function randomNumber () {
  return Math.round(Math.random() * 365)
}
function deadline () {
  return moment().subtract(randomNumber, 'days').toISOString()
}

const txProfliferator = () => {
  const transactionList = []
  for (let i = 0; i < 20; i++) {
    const transaction = {
      counterparty: 'SHOULD BE AGENT 1',
      amount: amount(),
      notes: notes(),
      deadline: deadline()
    }
    transactionList.push(transaction)
  }
  return transactionList
}

const Agent2TransactionLedger = {
  requests: txProfliferator(),
  offers: {
    initated: txProfliferator(),
    reponding: [{}]
  },
  acceptedTransactions: {
    offers: [{}]
  }
}

module.exports = Agent2TransactionLedger
