import wait from 'waait'
import { DNA_INSTANCE, MOCK_EXPIRATION_DATE, SCREENSHOT_PATH } from '../utils/global-vars'

const getTimestamp = () => new Date().toISOString()

export const closeTestConductor = (agent, testName) => {
  try {
    agent.kill()
  }
  catch (err) {
    throw new Error(`Error when killing conductor for the ${testName} test : ${err}`)
  }
}

export const findIframe = async (page, url, pollingInterval = 1000) => {
  return new Promise(async resolve => {
    const poll = setInterval(async () => {
      const iFrame = page.frames().find(frame => frame.url().includes(url))
      if (iFrame) {
        clearInterval(poll)
        resolve(iFrame)
      }
    }, pollingInterval)
  })
}

export const waitLoad = async (checkLoading, pollingInterval = 1000) => {
  return new Promise(async resolve => {
    const poll = setInterval(async () => {
      const isLoaded = checkLoading()
      if (isLoaded) {
        clearInterval(poll)
        resolve(isLoaded)
      }
    }, pollingInterval)
  })
}


export const waitZomeResult = async (checkResult, timeout = TIMEOUT, pollingInterval = 1000) => {                                                                  
  return setTimeout(new Promise(async resolve => {                                                           
    const poll = setInterval(async () => {   
      const callResultRaw = checkResult() 
      console.log('callResultRaw >>>>>', callResultRaw)
      console.log('callResultRaw.Ok :', callResultRaw.Ok) 
      const callResult = callResultRaw.Ok                     
      if (callResult) {                                                                                    
        clearInterval(poll)                                                                                 
        resolve(callResult)                                                                              
      }                                                                                                                                                                         
    }, pollingInterval)                                                                                         
  }), timeout)                                                                                                
}

export const takeSnapshot = async (page, fileName) => await page.screenshot({path: SCREENSHOT_PATH + `/${fileName}.png`})

export const holoAuthenticateUser = async (page, frame, userEmail = '', userPassword = '', type = 'signup') => {
  const pascalType = type === 'signup' ? 'SignUp' : 'LogIn'
  await frame.click(`button[onclick="show${pascalType}()"]`)
  await wait(100)
  await frame.type(`#${type}-email`, userEmail, { delay: 100 })
  await frame.type(`#${type}-password`, userPassword, { delay: 100 })
  const email = await frame.$eval(`#${type}-email`, el => el.value)
  const password = await frame.$eval(`#${type}-password`, el => el.value)

  let confirmation
  if (type === 'signup') {
    await frame.type(`#${type}-password-confirm`, userPassword, { delay: 100 })
    confirmation = await frame.$eval(`#${type}-password-confirm`, el => el.value)
  }

  await takeSnapshot(page, `${type}Modal`)

  const buttonTypeIndex = type === 'signup' ? 1 : 0
  const submitButtons = await frame.$$('button[onclick="formSubmit()"]')
  const SignUpButton = submitButtons[buttonTypeIndex]
  SignUpButton.click()

  return { email, password, confirmation }
}

export const awaitSimpleConsistency = async (s, hostInstanceId, holochainPlayers = [], hostedPlayers = []) => {
  // console.log('>>>>>>>>>> INSIDE awaitSImpleConsistency <<<<<<<<<<< hostInstanceId, holochainPlayers, hostedPlayers', hostInstanceId, holochainPlayers, hostedPlayers)
  // console.log('Tryorama S: ', s)
  if (!hostInstanceId) throw new Error('Attempted to await SimpleConsistency without providing a proper instance...')
  try {
    // await s.simpleConsistency('holofuel', [], [alice])
    await s.simpleConsistency(hostInstanceId, holochainPlayers, [])
  } catch (error) {
    throw console.error('Failed to reach conistency. Err: ', error)
  }
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
  // await awaitSimpleConsistency(tryoramaScenario, DNA_INSTANCE, [agent], [])
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
    await awaitSimpleConsistency(tryoramaScenario, DNA_INSTANCE, [spender, receiver], [])

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
    await awaitSimpleConsistency(tryoramaScenario, DNA_INSTANCE, [receiver, spender], [])

    const spenderLedger = await spender.callSync(DNA_INSTANCE, "transactor", "get_ledger", {} )
    const receiverLedger = await receiver.callSync(DNA_INSTANCE, "transactor", "get_ledger", {} )
    const spenderBalance = spenderLedger.Ok.balance
    const receiverBalance = receiverLedger.Ok.balance
    return { receiverBalance, spenderBalance, request_args }
  }
}
