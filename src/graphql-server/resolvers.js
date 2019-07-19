export const resolvers = {
  Mutation: {
    myMutation (_, mutationData) {
      return mutationData.myString + '-mutated'
    }
  },

  Query: {
    myQuery () {
      return {
        myString: 'data'
      }
    }
  }
}

export default resolvers
