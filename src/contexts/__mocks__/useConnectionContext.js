const connectionStatus = {
  hpos: true,
  holochain: true
}
const setConnectionStatus = jest.fn()

export default () => ({
  connectionStatus,
  setConnectionStatus
})
