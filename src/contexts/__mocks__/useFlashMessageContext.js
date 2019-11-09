const message = 'mock message'
const time = 123
export const newMessage = jest.fn()

export default () => ({
  message,
  time,
  newMessage
})
