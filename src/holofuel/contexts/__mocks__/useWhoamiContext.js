import { agent1 } from 'utils/const'

const whoami = agent1
const setWhoami = jest.fn()

const isLoading = false
const setIsLoading = jest.fn()

export default () => ({
  whoami,
  setWhoami,
  isLoading,
  setIsLoading
})
