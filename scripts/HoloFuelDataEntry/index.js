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
const OFFER = 'offers.initated'
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
  if (transactionTrace || transactionTrace === 0) {
    // For payment of a request or acceptance of a payment:
    const otherAgent = agentId === AGENT_1 ? AGENT_2 : AGENT_1
    origininatingTx = otherAgent[REQUEST][transactionTrace]
  }

  switch (type) {
    case REQUEST: {
      console.log('REQUEST ****************************')
      console.log('index', index)
      // console.log('txType[index]', txType[index])
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
      console.log('OFFER ****************************')
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
      console.log('PAY ****************************')
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
      console.log('ACCEPT ****************************')
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
        // console.log('------------------------------------------------------------------')
        console.log(`ARGS for the current ${zomeFuncName.toUpperCase()} ZomeCall : `, args)
        console.log('------------------------------------------------------------------')
        try {
          return callZome(instance, zomeName, zomeFuncName)(args).then(r => {
            console.log('Calling Zome Function-------------------------------------------------------------------')
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
      const agentScenarioFlow = async (agentNum) => {
        console.log('inside agentScenarioFlow')
        console.log('agentNum is 1: ', agentNum === AGENT_1)
        let CURRENT_AGENT, COUNTERPARTY_AGENT
        if (agentNum === AGENT_1) {
          CURRENT_AGENT = AGENT_1
          COUNTERPARTY_AGENT = AGENT_2
        } else if (agentNum === AGENT_2) {
          CURRENT_AGENT = AGENT_2
          COUNTERPARTY_AGENT = AGENT_1
        } else {
          throw new Error('Invalid agent number provided : ', agentNum)
        }

        // CASE 1 : Current Agent makes 10 full cycle REQUESTS
        const fullRequestCycle = async () => {
          for (let i = 0; i < arrayFirstHalf(CURRENT_AGENT.requests).length; i++) {
            await new Promise(resolve => {
              console.log('################################')
              console.log('Iteration Number (index) : ', i)
              let txOriginId
              // Agent 1 Requests HF
              console.log('REQUESTING')
              transactHoloFuel(CURRENT_AGENT, REQUEST, holochainZomeCall, { index: i })
              // Agent 2 Offers HF in response to Agent 1's request
                .then(r => {
                  const { Ok: originId } = JSON.parse(r)
                  txOriginId = originId
                  console.log('PAYING')
                  return transactHoloFuel(COUNTERPARTY_AGENT, PAY, holochainZomeCall, { transactionTrace: i, originId })
                })
                // Agent 1 Accepts HF offered by Agent 2 and completes originating Request
                .then(res => {
                  console.log('txOriginId : ', txOriginId)
                  console.log('ACCEPTING')
                  resolve(transactHoloFuel(CURRENT_AGENT, ACCEPT, holochainZomeCall, { originId: txOriginId }))
                })
                .catch(error => { return error })
            })
          }
        }
        const halfRequestsLength = halfArrayLength(CURRENT_AGENT.requests)
        const forthRequestsLength = Math.ceil((halfRequestsLength) / 2)
        const halfInitiatingOffersLength = halfArrayLength(CURRENT_AGENT.offers.initated)

        // CASE 2 : Current Agent makes 5 REQUESTS & counterparty offers to pay (5 * 2/3 tx-cycle requests)
        const twoPartsRequestCycle = async () => {
          console.log('!!!!!!!!!!! twoPartsRequestCycle start !!!!!!!!!!! length of this cycle: ', arrayFirstHalf(arraySecondHalf(CURRENT_AGENT.requests)).length)
          for (let i = 0; i < arrayFirstHalf(arraySecondHalf(CURRENT_AGENT.requests)).length; i++) {
            await new Promise(resolve => {
              console.log('>>>>>>>> twoPartsRequestCycle <<<<<<<<<<')
              i = i + halfRequestsLength
              console.log('Iteration Number (index) : ', i)
              console.log('REQUESTING')
              // Current Agent Requests HF
              transactHoloFuel(CURRENT_AGENT, REQUEST, holochainZomeCall, { index: i })
                // Transactee Agent Offers HF in response to Current Agent's request
                .then(r => {
                  const { Ok: originId } = JSON.parse(r)
                  console.log('PAYING')
                  resolve(transactHoloFuel(COUNTERPARTY_AGENT, PAY, holochainZomeCall, { transactionTrace: i, originId }))
                })
                .catch(error => { return error })
            })
          }
          // process.exit()
        }

        // CASE 3 : Current Agent makes 5 REQUESTS & requests remain pending (5 * 1/3 tx-cycle requests)
        const onePartRequestCycle = async () => {
          console.log('!!!!!!!!!!! onePartRequestCycle start !!!!!!!!!! length of this cycle:', arraySecondHalf(arraySecondHalf(CURRENT_AGENT.requests)).length)
          for (let i = 0; i < arraySecondHalf(arraySecondHalf(CURRENT_AGENT.requests)).length; i++) {
            await new Promise(resolve => {
              i = i + halfRequestsLength + forthRequestsLength
              console.log('halfRequestsLength : ', halfRequestsLength)
              console.log('forthRequestsLength : ', forthRequestsLength)

              console.log('Iteration Number (index) : ', i)
              console.log('REQUESTING')
              // Current Agent Requests HF
              resolve(transactHoloFuel(CURRENT_AGENT, REQUEST, holochainZomeCall, { index: i }))
            })
              .catch(error => { return error })
          }
          // process.exit()
        }

        // // CASE 4 : Current Agent makes 5 PROMISES & counterparty Accepts them (5 * full-tx-cycle offers)
        // const fullOfferCycle = async () => {
        //   for (let i = 0; i < arrayFirstHalf(CURRENT_AGENT.offers.initated).length; i++) {
        //     await new Promise(resolve => {
        //       i = i + halfRequestsLength
        //       console.log('Iteration Number (index) : ', i)
        //       console.log('PROMISING / OFFERING')
        //       // Current Agent Offers HF
        //       transactHoloFuel(CURRENT_AGENT, OFFER, holochainZomeCall, { index: i })
        //         // Transactee Accepts HF offered by Current Agent and completes originating Promise/Offer
        //         .then(r => {
        //           const { Ok: originId } = JSON.parse(r)
        //           console.log('tx originId for ACCEPT payment Zome Call - PROMISE : ', originId)
        //           transactHoloFuel(COUNTERPARTY_AGENT, ACCEPT, holochainZomeCall, { transactionTrace: i, originId })
        //         })
        //         .catch(error => { return error })
        //     })
        //   }
        //   process.exit()
        // }

        // // CASE 5 : Current Agent makes 5 PROMISES & promises remain pending (5 * 1/2 tx-cycle offers)
        // const halfOfferCycle = async () => {
        //   for (let i = 0; i < arraySecondHalf(CURRENT_AGENT.offers.initated).length; i++) {
        //     await new Promise(resolve => {
        //       i = index + halfInitiatingOffersLength
        //       console.log('Iteration Number (index) : ', i)
        //       console.log('PROMISING / OFFERING')
        //     // Current Agent Offers HF
        //     transactHoloFuel(CURRENT_AGENT, OFFER, holochainZomeCall, { index: i })
        //       .catch(error => { return error })
        //     })
        //   }
        // }

        await fullRequestCycle()
        await twoPartsRequestCycle()
        await onePartRequestCycle()
        // await fullOfferCycle()
        // await halfOfferCycle()
      }
      agentScenarioFlow(AGENT_1)
      // agentScenarioFlow(AGENT_2)
    }) // end of script
  })

// //////////////////////////////////////////////////////////////////////////////////// //

// HF ACTION FLOWS (for all successful cases):
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
