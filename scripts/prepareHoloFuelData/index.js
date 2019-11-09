
const startTestConductor = require('../startTestConductor.js')
const agentScenarioFlow = require('./agent-scenario-flow.js')
// HoloFuel User Transactions Logs :
const Agent1TransactionLedger = require('./agent1-hf-ledger.js')
const Agent2TransactionLedger = require('./agent2-hf-ledger.js')

// Start Conductor & Load HoloFuel Data :
startTestConductor()
  .then(async () => {
    console.log('Successful connection to Conductor!')
    // Invoke Scenario Flow for Agents 1 & 2
    await agentScenarioFlow(Agent1TransactionLedger)
    await agentScenarioFlow(Agent2TransactionLedger)
  })
  .then(_ => process.exit())
