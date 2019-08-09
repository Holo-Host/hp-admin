import happStore from './happStore'
import hha from './hha'
// import conductor from './conductor'

// data is a tree organized by instanceId > zome > function
// leaves can either be data, or a function which is called with the zome call args, so can update other parts of the tree.

const data = {
  hylo: {
    people: {
      get_me: {
        address: 'fdkljsklj',
        name: 'H.P. Owner',
        avatar_url: 'myface.png'
      },
      is_registered: true,
      register_user: args => {
        data.hylo.people.get_me = {
          ...data.hylo.people.get_me,
          ...args
        }
        return data.hylo.people.get_me
      }
    }
  },
  'happ-store': happStore,
  hha
  // ,
  //  Note: Below leads to the Mock data for fn previousInstallHapp in envoyInterface.js and is DEPRECATED,
  // conductor
}

export default data
