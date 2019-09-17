const { connect } = require('@holochain/hc-web-client')
const axios = require('axios')
const Agent1TransactionLedger = require('./Agent1HFLedger.js')
const Agent2TransactionLedger = require('./Agent2HFLedger.js')

// HoloFuel Users :
const Agent1 = {
  agentId: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
  nick: 'Perry'
}
const Agent2 = {
  agentId: 'HcScic3VAmEP9ucmrw4MMFKVARIvvdn43k6xi3d75PwnOswdaIE3BKFEUr3eozi',
  nick: 'Sam'
}
// HoloFuel User Transactions Log :
const AGENT_1 = Agent1TransactionLedger
const AGENT_2 = Agent2TransactionLedger
// Transaction Types :
const Request = 'requests'
const Offer = 'offers.initated'
const Pay = 'offers.responding'
const Accept = 'acceptedTransactions.offers'

const startTestConductor = async () => {
  return new Promise((resolve, reject) => {
    const callToHC = axios.post('http://localhost:3300/admin/agent/list', {})
    resolve(callToHC)
  })
    .catch(e => console.log(' >>>>>>>>> Make sure your HC conductor is running! <<<<<<<<<  '))
}

const transactHoloFuel = (agentId, type, ZomeCall, { index, transactionTrace, originId }) => {
  const txType = agentId[type]
  const counterparty = agentId === AGENT_1 ? Agent2.agentId : Agent1.agentId
  let origininatingTx = null
  if (transactionTrace) {
    // For payment of a request or acceptance of a payment:
    const otherAgent = agentId === AGENT_1 ? AGENT_2 : AGENT_1
    origininatingTx = otherAgent[Request][transactionTrace]
  }

  switch (type) {
    case Request: {
      // initate request
      return ZomeCall(
        'holofuel',
        'transactions',
        'request',
        { from: counterparty,
          amount: txType[index].amount,
          notes: txType[index].notes,
          deadline: txType[index].deadline
        }
      )
    }
    case Offer: {
      // initiate offer
      return ZomeCall(
        'holofuel',
        'transactions',
        'promise',
        { to: counterparty,
          amount: txType[index].amount,
          notes: txType[index].notes,
          deadline: txType[index].deadline
        }
      )
    }
    case Pay: {
      // offer in response to request
      return ZomeCall(
        'holofuel',
        'transactions',
        'promise',
        {
          to: counterparty,
          amount: origininatingTx.amount,
          notes: 'Here is your Fuel!',
          deadline: origininatingTx.deadline,
          requestId: originId
        }
      )
    }
    case Accept: {
      // accept offer
      return ZomeCall(
        'holofuel',
        'transactions',
        'receive_payments_pending',
        {
          promises: originId
        }
      )
    }
    default:
      throw new Error('Error: No transaction TYPE was matched. Current transaction type : ', type)
  }
}

startTestConductor()
  .then(() => {
    connect({ url: 'ws://localhost:3400' }).then(({ callZome }) => {
      // Zome Call :
      const holochainZomeCall = (instance, zomeName, zomeFuncName, args) => {
        console.log('###################################################################')
        console.log(`ARGS for the current ${zomeFuncName.toUpperCase()} ZomeCall : `, args)
        try {
          return callZome(instance, zomeName, zomeFuncName)(args).then(r => {
            console.log(`${zomeFuncName.toUpperCase()} Zome Call SUCCESS!  Entry address : `, r)
            console.log('-------------------------------------------------------------------')
            return r
          })
            .catch(e => console.log('HC ZomeCall error occured. >> ERROR :  ', e))
        } catch (e) {
          console.log(`Error occured when connecting to HC conductor. >> ERROR: (${e})`)
        }
      }

      //
      // INPUT DATA HERE...
      // CASE 1 : Agent 1 makes 20 successful requests (full-tx-trip)
      Agent1TransactionLedger.requests.forEach((tx, index) => {
        let txOriginId
        // Agent 1 Requests HF
        transactHoloFuel(AGENT_1, Request, holochainZomeCall, { index, transactionTrace: null, originId: null })
          // Agent 2 Offers HF in response to Agent 1's request
          .then(r => {
            const { Ok: originId } = JSON.parse(r)
            txOriginId = originId
            transactHoloFuel(AGENT_2, Pay, holochainZomeCall, { transactionTrace: index, originId })
          })
          // Agent 1 Accepts HF offered by Agent 2 and completes originating Request
          .then(res => {
            const { Ok: resultingHash } = JSON.parse(res)
            console.log('Resulting Hash from Offer in response to last Request : ', resultingHash)
            transactHoloFuel(AGENT_1, Accept, holochainZomeCall, { transactionTrace: index, txOriginId })
          })
          .catch(error => { return error })
      })

      // HF ACTION FLOWS :
      // 1. Agent 1 Offer HF
      // transactHoloFuel(AGENT_1, Offer, 0, holochainZomeCall)
      // transactHoloFuel(AGENT_1, Offer, 0, holochainZomeCall, { transactionTrace: null, transactionId: null })

      // 2. Agent 1 Request HF
      // transactHoloFuel(AGENT_1, Request, 0, holochainZomeCall, { transactionTrace: null, transactionId: null })

      // 3. Agent 2 Offer HF (response to requested)
      // transactHoloFuel(AGENT_2, Pay, 0, holochainZomeCall, {transactionTrace: 0, transactionId: response })

      // 4. Agent 2 Accept HF (response to requested)
      // 5. Agent 2 Request HF
      // 6. Agent 2 Offer HF

      // 5. Agent 1 Accept HF (response to initiated and requested)
      // 6. Agent 1 Offer HF (response to requested)
      //
    }) // end of script
  })

module.exports = Agent2
