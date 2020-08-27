import { fireEvent, wait, act } from '@testing-library/react'
import waait from 'waait'
import { DNA_INSTANCE, MOCK_EXPIRATION_DATE } from '../utils/global-vars'

const getTimestamp = () => new Date().toISOString()

export const closeTestConductor = (agent, testName) => {
  try {
    agent.kill()
  }
  catch(err){
    throw new Error(`Error when killing conductor for the ${testName} test : ${err}`);
  }
}

// export const hostLogin = async (queries, email = '', password = '') => {
//   return new Promise(resolve => {
//     const loginResult = async () => await act(async () => { // eslint-disable-line no-return-await
//       fireEvent.change(queries.getByLabelText('EMAIL:'), { target: { value: email } })
//       fireEvent.change(queries.getByLabelText('PASSWORD:'), { target: { value: password } })
//       fireEvent.click(queries.getByText('Login'))
//       await waait(0)
//       return wait(() => queries.getByText('HoloFuel'))
//     })
//     resolve(loginResult)
//   })
// }

export const addNickname = async(tryoramaScenario, agent, nickname) => {
  const profile_args = {
    nickname,
    agent_address: agent.info(DNA_INSTANCE).agentAddress,
    avatar_url: `https://cdn.pixabay.com/${nickname}-photo.png`,
    uniqueness: `${nickname}FirstEntry`
  }
  const result = await agent.callSync(DNA_INSTANCE, "profile", "update_my_profile", profile_args )
  await tryoramaScenario.consistency()
  return result
}

export const preseedOffer = async(tryoramaScenario, spender, receiver, volume = 1) => {
  let amountOffered = 0 
  for (let i = 0; i < volume; i++) {
    const amount = (volume * 100)
    amountOffered = amountOffered + amount

    const offer_args = {
      receiver: receiver.info(DNA_INSTANCE).agentAddress,
      amount: amount.toString(),
      note: `Preseed: Offer #${volume}`,
      timestamp: getTimestamp(),
      expiration_date: MOCK_EXPIRATION_DATE
    }
    await spender.callSync(DNA_INSTANCE, "transactor", "create_promise", offer_args )
    await tryoramaScenario.consistency()

    const spenderLedger = await spender.callSync(DNA_INSTANCE, "transactor", "get_ledger", {} )
    const receiverLedger = await receiver.callSync(DNA_INSTANCE, "transactor", "get_ledger", {} )
    const spenderBalance = spenderLedger.Ok.balance
    const receiverBalance = receiverLedger.Ok.balance
    return { spenderBalance, receiverBalance, offer_args }
  }
}

export const preseedRequest = async (tryoramaScenario, receiver, spender, volume = 1) => {
  let amountRequested = 0
  for (let i = 0; i < volume; i++) {
    const amount = (volume * 100)
    amountRequested = amountRequested + amount

    const request_args = {
      spender: spender.info(DNA_INSTANCE).agentAddress,
      amount: amount.toString(),
      note: `Preseed: Request #${volume}`,
      timestamp: getTimestamp()
    }
    await receiver.callSync(DNA_INSTANCE, "transactor", "create_invoice", request_args )
    await tryoramaScenario.consistency()

    const spenderLedger = await spender.callSync(DNA_INSTANCE, "transactor", "get_ledger", {} )
    const receiverLedger = await receiver.callSync(DNA_INSTANCE, "transactor", "get_ledger", {} )
    const spenderBalance = spenderLedger.Ok.balance
    const receiverBalance = receiverLedger.Ok.balance
    return { receiverBalance, spenderBalance, request_args }
  }
}

