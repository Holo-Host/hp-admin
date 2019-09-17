const { connect } = require('@holochain/hc-web-client')
const axios = require('axios')
const Agent1HFLedger = require('./Agent1HFLedger.js/index.js.js')

function testConductor () {
  return new Promise((resolve, reject) => {
    const callToHC = axios.post('http://localhost:3300/admin/agent/list', {})
    resolve(callToHC)
  })
    .catch(e => console.log(' >>>>>>>>> Make sure your HC conductor is running! <<<<<<<<<  '))
}

testConductor()
  .then(() => {
    connect({ url: 'ws://localhost:3400' }).then(({ callZome }) => {
      const holochainZomeCall = (instance, zomeName, zomeFuncName, args) => {
        try {
          return callZome(instance, zomeName, zomeFuncName)(args).then(r => {
            console.log(`${zomeFuncName} SUCCESS!  Entry address : `, r)
            return r
          })
            .catch(e => console.log('HC ZomeCall error occured. >> ERROR :  ', e))
        } catch (e) {
          console.log(`Error occured when connecting to HC conductor. >> ERROR: (${e})`)
        }
      }

      const HOLOFUEL_TRANSACTIONS = {
        // request
        requestHF: (agentId, type, index) => {
          const txType = `${agentId}HFLedger`[type]
          return holochainZomeCall(
            'holofuel',
            'transactions',
            'request',
            {
              counterparty: txType[index].counterparty,
              amount:txType[index].amount
            }
          )
        },
        // offer
        offerHfInitiation: (agentId, type, index) => {
          const txType = `${agentId}HFLedger`[type]
          return holochainZomeCall(
            'holofuel',
            'transactions',
            'offer',
            {
              counterparty: txType[index].counterparty,
              amount:txType[index].amount
            }
          )
        },
        // offer in response to request
        offerHfResponse: (agentId, type, index) => {
          const txType = `${agentId}HFLedger`[type]
          return holochainZomeCall(
            'holofuel',
            'transactions',
            'offer',
            {
              counterparty: txType[index].counterparty,
              amount:txType[index].amount,
              requestId:txType[index].requestId
            }
          )
        },
        // accept offer
        acceptHF: (agentId, type, index) => {
          const txType = `${agentId}HFLedger`[type]
          return holochainZomeCall(
            'holofuel',
            'transactions',
            'accept_promise',
            {
              counterparty: txType[index].counterparty,
              amount:txType[index].amount
            }
          )
        },
      }

      // INPUT DATA HERE...
      1. Agent 1 Request HF 
      2. Agent 1 Offer HF
      
      3. Agent 2 Offer HF (response to requested)
      4. Agent 2 Accept HF (response to requested)
      5. Agent 2 Request HF
      6. Agent 2 Offer HF

      5. Agent 1 Accept HF (response to initiated and requested)
      6. Agent 1 Offer HF (response to requested)

    }) // end of script
  })
