import { agent1 } from 'utils/const'

const whoami = agent1
const setWhoami = jest.fn()

export default () => ({
  whoami,
  setWhoami
})
