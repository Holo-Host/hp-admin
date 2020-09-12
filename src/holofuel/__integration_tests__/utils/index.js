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

export const findIframe = async (page, url) => {                                                                  
  return new Promise(async resolve => {
    const pollingInterval = 1000;                                                                
    const poll = setInterval(async function waitForIFrameToLoad() {   
      const iFrame = page.frames().find(frame => frame.url().includes(url));                         
      if (iFrame) {                                                                                    
        clearInterval(poll);                                                                                  
        resolve(iFrame);                                                                               
      }                                                                                                                                                                         
    }, pollingInterval);                                                                                          
  });                                                                                                  
}

export const holoAuth = async (frame, userEmail = '', userPassword = '', type = 'signup', { asyncCallback }) => {
  const pascalType = type === 'signup' ? 'SignUp' : 'SignIn'
  await frame.click(`button[onclick="show${pascalType}()"]`)
  await frame.type(`#${type}-email`, userEmail, { delay: 100 })
  await frame.type(`#${type}-password`, userPassword, { delay: 100 })
  await frame.type(`#${type}-password-confirm`, userPassword, { delay: 100 })
  const email = await frame.$eval(`#${type}-email`, el => el.value)
  const password = await frame.$eval(`#${type}-password`, el => el.value)
  const confirmation = await frame.$eval(`#${type}-password-confirm`, el => el.value)      

  
  const buttonTypeIndex = type === 'signup' ? 1 : 0
  const button = await frame.$$('button[onclick="formSubmit()"]')
  const SignUpButton = button[buttonTypeIndex]
  
  await asyncCallback()
  SignUpButton.click()

  return { email, password, confirmation }
}

export const addNickname = async(tryoramaScenario, agent, nickname) => {
  const profile_args = {
    nickname,
    agent_address: agent.info(DNA_INSTANCE).agentAddress,
    avatar_url: `https://cdn.pixabay.com/${nickname}-photo.png`,
    uniqueness: `${nickname}FirstEntry`
  }
  const result = await agent.callSync(DNA_INSTANCE, "profile", "update_my_profile", profile_args )

  // wait for DHT consistency
  if (!await tryoramaScenario.simpleConsistency("app", [agent], [])) {
    throw new Error("Failed to reach consistency after making new offer")
  }

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
    
    // wait for DHT consistency
    if (!await tryoramaScenario.simpleConsistency("app", [spender, receiver], [])) {
      throw new Error("Failed to reach consistency after making new offer")
    }

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
    
    // wait for DHT consistency
    if (!await tryoramaScenario.simpleConsistency("app", [receiver, spender, []])) {
      throw new Error("Failed to reach consistency after making new request")
    }

    const spenderLedger = await spender.callSync(DNA_INSTANCE, "transactor", "get_ledger", {} )
    const receiverLedger = await receiver.callSync(DNA_INSTANCE, "transactor", "get_ledger", {} )
    const spenderBalance = spenderLedger.Ok.balance
    const receiverBalance = receiverLedger.Ok.balance
    return { receiverBalance, spenderBalance, request_args }
  }
}

