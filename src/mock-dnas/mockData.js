// data is a tree organized by instanceId > zome > function

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
        data.hylo.people.get_me = args
        return args
      }
    }
  },
  'happ-store': {
    whoami: {
      get_user: {
        hash: 'browns',
        name: 'H.P. Owner'
      }
    }
  }
}

export default data
