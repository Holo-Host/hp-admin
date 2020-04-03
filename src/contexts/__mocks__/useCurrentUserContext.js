import { agent1 } from 'utils/const'

const currentUser = { hostPubKey: agent1, hostName: 'Sam Rose Host' }
const setCurrentUser = jest.fn()

export default () => ({
  currentUser,
  setCurrentUser
})
