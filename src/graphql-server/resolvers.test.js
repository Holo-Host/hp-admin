import resolvers from './resolvers'

describe('resolvers', () => {
  describe('Query.allHapps', () => {
    it('returns expected results', async () => {
      const results = await resolvers.Query.allHapps()
      expect(results).toHaveLength(2)
      expect(results[0].title).toEqual('Holofuel')
      expect(results[1].title).toEqual('Holo Community')
      expect(results[0].hash).toEqual('foiyuoiyZXBVNBVCuibce')
    })
  })
})
