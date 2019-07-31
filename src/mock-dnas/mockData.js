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
  'happ-store': {
    whoami: {
      get_user: {
        hash: 'browns',
        name: 'H.P. Owner'
      }
    },
    happs: {
      get_all_apps: [
        {
          address: 'QmXxiimzfcSHYqHXV2z6WNopeiFnPBx9YKnHzPcq9o8VoT',
          appEntry: {
            title: 'Holofuel',
            author: 'Holo ltd',
            description: 'The holofuel hApp',
            thumbnailUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2cMFvYqaw7TtcTkPFcwE8pupKWqLFMCFu2opap9jqUoqIcAKB',
            homepageUrl: 'https://holo.host/faq/what-is-holo-fuel/',
            dnas: [
              {
                location: 'someurl.com/dna',
                hash: 'foiyuoiyZXBVNBVCuibce',
                handle: 'bars'
              }
            ],
            ui: {
              location: 'someurl.com/ui',
              hash: 'flkjdflksdjfldskjf',
              handle: null
            }
          },
          upvotes: 0,
          upvotedByMe: false
        },
        {
          address: 'QmXx7imYqHXV2z6WNopeiFnPBx9YKnHzPcq9o8VoTzfcSH',
          appEntry: {
            title: 'Holo Community',
            author: 'Holo ltd',
            description: 'The community chat and message board hApp',
            thumbnailUrl: 'https://d3ngex8q79bk55.cloudfront.net/misc/default_community_avatar.png',
            homepageUrl: 'https://hylo.com',
            dnas: [
              {
                location: 'someurl.com/dna',
                hash: 'sd;lmsdl;masd;lmds;lmasdlsadm;ldmo',
                handle: 'bars'
              }
            ],
            ui: {
              location: 'someurl.com/ui',
              hash: 'flkjdflksdjfldskjf',
              handle: null
            }
          },
          upvotes: 0,
          upvotedByMe: false
        }
      ]
    }
  },
  hha: {
    host: {
      register_as_host: {
        address: 'QmMockAddressHash'
      }
    }
  }
}

export default data
