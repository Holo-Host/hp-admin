import resolvers from './resolvers'
import { hostingUserId } from 'mock-dnas/hha'
import mockData from 'mock-dnas/mockData'

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
        const spy = jest.spyOn(mockData.hha.host, 'register_as_host')
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
