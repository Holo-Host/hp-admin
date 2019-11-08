export const authToken = 'authtoken'
const isAuthed = false
const setAuthToken = jest.fn()
const setIsAuthed = jest.fn()

export default () => ({
  authToken,
  isAuthed,
  setAuthToken,
  setIsAuthed
})
