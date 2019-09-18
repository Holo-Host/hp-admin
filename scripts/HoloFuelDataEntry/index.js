const { connect } = require('@holochain/hc-web-client')
const axios = require('axios')
const Agent1TransactionLedger = require('./Agent1HFLedger.js')
const Agent2TransactionLedger = require('./Agent2HFLedger.js')

// HoloFuel Users :
const Agent1 = {
  // agentId: <CONDUCTOR_AGENT_1>,
  agentId: 'HcSCIdm3y8fjJ8g753YEMOo4qdIctqsqrxpIEnph7Fj7dm4ze776bEPDwxoog8a',
  nick: 'Perry'
}
const Agent2 = {
  // agentId: <CONDUCTOR_AGENT_2>,
  agentId: 'HcScic3VAmEP9ucmrw4MMFKVARIvvdn43k6xi3d75PwnOswdaIE3BKFEUr3eozi',
  nick: 'Sam'
}
// HoloFuel User Transactions Log :
const AGENT_1 = Agent1TransactionLedger
const AGENT_2 = Agent2TransactionLedger
// Transaction Types :
const REQUEST = 'requests'
const OFFER = 'offers.initated' // *STILL NEEDS IMPLEMENTATION*
const PAY = 'offers.responding'
const ACCEPT = 'acceptedTransactions.offers'

const startTestConductor = async () => {
  return new Promise((resolve, reject) => {
    const callToHC = axios.post('http://localhost:3300/admin/agent/list', {})
    resolve(callToHC)
  })
    .catch(e => console.log(` >>>>>>>>>>>>>>>>>>> ERROR: NO HC Conductor Found. <<<<<<<<<<<<<<< \n >>>>>>>>> NOTE: Make sure your HC conductor is running! <<<<<<<<<  `))
}

const transactHoloFuel = (agentId, type, ZomeCall, { index, transactionTrace, originId }) => {
  const txType = agentId[type]
  const counterparty = agentId === AGENT_1 ? Agent2.agentId : Agent1.agentId
  let origininatingTx = null
  if (transactionTrace) {
    // For payment of a request or acceptance of a payment:
    const otherAgent = agentId === AGENT_1 ? AGENT_2 : AGENT_1
    origininatingTx = otherAgent[REQUEST][transactionTrace]
  }

  switch (type) {
    case REQUEST: {
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
    case OFFER: {
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
    case PAY: {
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
    case ACCEPT: {
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
      const halfArrayLength = (array) => Math.ceil((array.length - 1) / 2)
      const arrayFirstHalf = (array) => array.slice(0, halfArrayLength(array))
      const arraySecondHalf = (array) => array.slice(halfArrayLength(array))

      // //////////////////////////////////////////////////////////////////////////////////// //
      // Zome Call :
      const holochainZomeCall = (instance, zomeName, zomeFuncName, args) => {
        console.log('###################################################################')
        console.log(`ARGS for the current ${zomeFuncName.toUpperCase()} ZomeCall : `, args)
        console.log('###################################################################')
        try {
          return callZome(instance, zomeName, zomeFuncName)(args).then(r => {
            console.log('-------------------------------------------------------------------')
            console.log(`${zomeFuncName.toUpperCase()} Zome Call SUCCESS!  Entry address : `, r)
            console.log('-------------------------------------------------------------------')
            return r
          })
            .catch(e => console.log('HC ZomeCall error occured. >> ERROR :  ', e))
        } catch (e) {
          console.log(`Error occured when connecting to HC conductor. >> ERROR: (${e})`)
        }
      }

      // //////////////////////////////////////////////////////////////////////////////////// //
      // INPUT DATA:
      const agentScenarioFlow = (agentNum) => {
        let AGENT, currentAgentID, transacteeID
        if (agentNum === 1) {
          AGENT = AGENT_1
          currentAgentID = Agent1.agentId
          transacteeID = Agent2.agentId
        }
        if (agentNum === 2) {
          AGENT = AGENT_2
          currentAgentID = Agent1.agentId
          transacteeID = Agent2.agentId
        } else throw new Error('Invalid agent number provided : ', agentNum)

        const halfRequestsLength = halfArrayLength(AGENT.requests)
        const forthRequestsLength = halfArrayLength(halfArrayLength(AGENT.requests))
        const halfInitiatingOffersLength = halfArrayLength(AGENT.offers.initated)

        // CASE 1 : Current Agent makes 10 full cycle REQUESTS
        // arrayFirstHalf(AGENT.requests).forEach((tx, index) => {
        //   console.log('REQUEST index # : ', index)

        //   let txOriginId
        //   // Current Agent Requests HF
        //   transactHoloFuel(currentAgentID, REQUEST, holochainZomeCall, { index })
        //     // Transactee Agent Offers HF in response to Current Agent's request
        //     .then(r => {
        //       const { Ok: originId } = JSON.parse(r)
        //       txOriginId = originId
        //       transactHoloFuel(transacteeID, PAY, holochainZomeCall, { transactionTrace: index, originId })
        //     })
        //     // Current Agent Accepts HF offered by Transactee Agent and completes originating Request
        //     .then(res => {
        //       const { Ok: resultingHash } = JSON.parse(res)
        //       console.log('Resulting Hash from Offer in response to last Request : ', resultingHash)
        //       console.log('tx originId for ACCEPT payment Zome Call - REQUESTS: ', txOriginId)
        //       transactHoloFuel(currentAgentID, ACCEPT, holochainZomeCall, { transactionTrace: index, originId: txOriginId })
        //     })
        //     .catch(error => { return error })
        // })

        // CASE 2 : Current Agent makes 5 REQUESTS & counterparty offers to pay (5 * 2/3 tx-cycle requests)
        arrayFirstHalf(arraySecondHalf(AGENT.requests)).forEach((tx, index) => {
          index = index + halfRequestsLength
          console.log('REQUEST index # : ', index)

          // Current Agent Requests HF
          transactHoloFuel(currentAgentID, REQUEST, holochainZomeCall, { index })
            // Transactee Agent Offers HF in response to Current Agent's request
            .then(r => {
              const { Ok: originId } = JSON.parse(r)
              transactHoloFuel(transacteeID, PAY, holochainZomeCall, { transactionTrace: index, originId })
            })
            .catch(error => { return error })
        })

        // // CASE 3 : Current Agent makes 5 REQUESTS & requests remain pending (5 * 1/3 tx-cycle requests)
        // arraySecondHalf(arraySecondHalf(AGENT.requests)).forEach((tx, index) => {
        //   index = index + (halfRequestsLength + forthRequestsLength)
        //   console.log('REQUEST index # : ', index)

        //   // Current Agent Requests HF
        //   transactHoloFuel(currentAgentID, REQUEST, holochainZomeCall, { index })
        //     .catch(error => { return error })
        // })

        // // CASE 4 : Current Agent makes 5 PROMISES & counterparty Accepts them (5 * full-tx-cycle offers)
        // arrayFirstHalf(AGENT.offers.initated).forEach((tx, index) => {
        //   console.log('PROMISE / OFFER index # : ', index)

        //   // Current Agent Offers HF
        //   transactHoloFuel(currentAgentID, OFFER, holochainZomeCall, { index })
        //     // Transactee Accepts HF offered by Current Agent and completes originating Promise/Offer
        //     .then(r => {
        //       const { Ok: originId } = JSON.parse(r)
        //       console.log('tx originId for ACCEPT payment Zome Call - PROMISE : ', originId)
        //       transactHoloFuel(currentAgentID, ACCEPT, holochainZomeCall, { transactionTrace: index, originId })
        //     })
        //     .catch(error => { return error })
        // })

        // // CASE 5 : Current Agent makes 5 PROMISES & promises remain pending (5 * 1/2 tx-cycle offers)
        // arraySecondHalf(AGENT.offers.initated).forEach((tx, index) => {
        //   index = index + halfInitiatingOffersLength
        //   console.log('PROMISE / OFFER index # : ', index)

        //   // Current Agent Offers HF
        //   transactHoloFuel(currentAgentID, OFFER, holochainZomeCall, { index })
        //     .catch(error => { return error })
        // })
      }

      agentScenarioFlow(1)

      // //////////////////////////////////////////////////////////////////////////////////// //

      // HF ACTION FLOWS (for all successfull cases):
      // 1. Agent 1 Requests HF
      // 2. Agent 2 Offers HF (response to requested)
      // 3. Agent 1 Accepts Offered HF

      // 4. Agent 1 Offers HF (initiated)
      // 5. Agent 2 Accepts Offered HF

      // 6. Agent 2 Requests HF
      // 7. Agent 1 Offers HF (response to requested)
      // 8. Agent 2 Accepts HF

      // 9.  Agent 2 Offers HF (initiated)
      // 10. Agent 1 Accepts Offered HF

      // //////////////////////////////////////////////////////////////////////////////////// //

      // agentScenarioFlow(1)
      // agentScenarioFlow(2)
    }) // end of script
  })

module.exports = Agent2
