const isConnected = {
  hpos: true,
  holochain: true
}
const setIsConnected = jest.fn()

export default () => ({
  isConnected,
  setIsConnected
})
