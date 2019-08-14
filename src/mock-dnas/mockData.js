import { cloneDeep } from 'lodash/fp'
import happStore from './happStore'
import hha from './hha'

// data is a tree organized by instanceId > zome > function
// leaves can either be an object, or a function which is called with the zome call args, so can update other parts of the tree.

const defaultData = {
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
}

let data = cloneDeep(defaultData)

export function resetMockData () {
  data = cloneDeep(defaultData)
}

export default data
