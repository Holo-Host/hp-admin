export const currentUser = {
  id: '1',
  nickname: 'Alice',
  avatarUrl: ''
}

const currentUserLoading = false

export const setCurrentUser = jest.fn()
export const setCurrentUserLoading = jest.fn()

export default () => ({
  currentUser,
  currentUserLoading,
  setCurrentUser,
  setCurrentUserLoading
})
