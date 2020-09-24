import wait from 'waait'
import { DNA_INSTANCE, SCREENSHOT_PATH, TIMEOUT } from '../utils/global-vars'

export const closeTestConductor = (agent, testName) => {
  try {
    agent.kill()
  } catch (err) {
    throw new Error(`Error when killing conductor for the ${testName} test : ${err}`)
  }
}

export const findIframe = async (page, url, pollingInterval = 1000) => {
  return new Promise(resolve => {
    const poll = setInterval(() => {
      const iFrame = page.frames().find(frame => frame.url().includes(url))
      if (iFrame) {
        clearInterval(poll)
        resolve(iFrame)
      }
    }, pollingInterval)
  })
}

export const waitLoad = async (checkLoading, pollingInterval = 1000) => {
  return new Promise(resolve => {
    const poll = setInterval(() => {
      const isLoaded = checkLoading()
      if (isLoaded) {
        clearInterval(poll)
        resolve(isLoaded)
      }
    }, pollingInterval)
  })
}

export const waitZomeResult = async (asyncCheck, timeout = TIMEOUT, pollingInterval = 1000) => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Waited for ${timeout / 1000} seconds`, timeout))
    }, timeout)
    const poll = setInterval(async () => {
      const callResultRaw = await asyncCheck()
      console.log('callResultRaw >>>>>', callResultRaw)
      console.log('callResultRaw.Ok :', callResultRaw.Ok)
      const callResult = callResultRaw.Ok
      if (callResult) {
        clearInterval(poll)
        clearTimeout(timeoutId)
        resolve(callResult)
      }
    }, pollingInterval)
  })
}

export const takeSnapshot = async (page, fileName) => page.screenshot({ path: SCREENSHOT_PATH + `/${fileName}.png` })

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

export const simpleConsistency = async (tryoramaScenario, hostInstanceId, holochainPlayers = [], hostedPlayers = []) => {
  if (!hostInstanceId) throw new Error('Attempted to await SimpleConsistency without providing a proper instance...')
  try {
    await tryoramaScenario.simpleConsistency(hostInstanceId, holochainPlayers, hostedPlayers)
  } catch (error) {
    throw console.error('Failed to reach conistency. Err: ', error)
  }
}

export const addNickname = async (tryoramaScenario, agent, nickname) => {
  const profileArgs = {
    nickname,
    agent_address: agent.info(DNA_INSTANCE).agentAddress,
    avatar_url: `https://cdn.pixabay.com/${nickname}-photo.png`,
    uniqueness: `${nickname}FirstEntry`
  }
  const result = await agent.callSync(DNA_INSTANCE, 'profile', 'update_my_profile', profileArgs)

  // wait for DHT consistency (for only current agent)
  try {
    await tryoramaScenario.simpleConsistency(DNA_INSTANCE, [agent], [])
  } catch (error) {
    throw console.error('Failed to reach conistency. Err: ', error)
  }
  return result
}
