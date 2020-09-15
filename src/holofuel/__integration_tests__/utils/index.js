import { DNA_INSTANCE, MOCK_EXPIRATION_DATE, SCREENSHOT_PATH } from '../utils/global-vars'

const getTimestamp = () => new Date().toISOString()

export const takeSnapshot = async (page, fileName) => await page.screenshot({path: SCREENSHOT_PATH + `/${fileName}.png`})

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

export const waitForPageLoad = async (page, pollingInterval = 1000) => {                                                                
    return new Promise(async resolve => {                                                               
      const poll = setInterval(async () => {
        // we check for h1 as 'Test Fuel' should always be present on rendered page
        const pageTitle = await page.$$('h1')
        const hasPageLoaded = !!pageTitle
        if (hasPageLoaded) {                                                                                    
          clearInterval(poll)                                                                                 
          resolve(hasPageLoaded)                                                                              
        }                                                                                                                                                                         
      }, pollingInterval)                                                                                         
    })
}


// export const waitForZomeCallResponse = async (page, pollingInterval = 1000) => {                                                                
//   return new Promise(async resolve => {                                                               
//     const poll = setInterval(async () => {
//       const pageTitle = await page.$$('h1')
//       // const receivedReponse = 
//       if (receivedReponse) {                                                                                    
//         clearInterval(poll)                                                                                 
//         resolve(receivedReponse)                                                                              
//       }                                                                                                                                                                         
//     }, pollingInterval)                                                                                         
//   })
// }


export const holoAuthenticateUser = async (page, frame, userEmail = '', userPassword = '', type = 'signup') => {
  const pascalType = type === 'signup' ? 'SignUp' : 'LogIn'
  await frame.click(`button[onclick="show${pascalType}()"]`)
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
  console.log('>>>>>>>>>> INSIDE awaitSImpleConsistency <<<<<<<<<<< ')
  if (!hostInstanceId) throw new Error('Attempted to await SimpleConsistency without providing a proper instance...')
  try {
    // await s.simpleConsistency('holofuel', [], [alice])
    await s.simpleConsistency(hostInstanceId, holochainPlayers, hostedPlayers)
  } catch (error) {
    throw new Error(`Failed to reach consistency. ${err}`)
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

