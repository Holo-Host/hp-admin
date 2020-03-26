import { agent1 } from 'utils/const'

const whoami = { hostPubKey: agent1, hostName: 'Sam Rose Host' }
const setWhoami = jest.fn()

export default () => ({
  whoami,
  setWhoami
})
