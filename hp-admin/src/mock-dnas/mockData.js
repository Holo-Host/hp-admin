import happStore from './happStore'
import hha from './hha'
import holofuel from './holofuel'

// data is a tree organized by instanceId > zome > function
// leaves can either be an object, or a function which is called with the zome call args.
// DON'T use this function to update the tree, just to construct return values.

const data = {
  hylo: {
    people: {
      get_me: {
        address: 'fdkljsklj',
        name: 'H.P. Owner',
        avatar_url: 'myface.png'
      },
      is_registered: true,
      register_user: args => ({
        ...data.hylo.people.get_me,
        ...args
      })
    }
  },
  'happ-store': happStore,
  hha,
  holofuel
}

export default data
