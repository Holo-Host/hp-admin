import resolvers from './resolvers'
import hha, { hostingUserId } from 'mock-dnas/hha'

describe('resolvers', () => {
  describe('Query', () => {
    describe('.hostingUser', () => {
      it('returns expected results', async () => {
        const hostingUser = await resolvers.Query.hostingUser()

        expect(hostingUser).toMatchObject({
          id: hostingUserId,
          isRegistered: false
        })
      })
    })
  })

  describe('Mutation', () => {
    describe('.registerHostingUser', () => {
      it('returns expected results', async () => {
        const spy = jest.spyOn(hha.host, 'register_as_host')
        const hostingUser = await resolvers.Mutation.registerHostingUser()

        expect(hostingUser).toMatchObject({
          id: hostingUserId,
          isRegistered: true
        })

        expect(spy).toHaveBeenCalled()
      })
    })
  })
})
