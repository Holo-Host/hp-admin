const data = {
  get: {
    'os-update': {
      version: '1.2.3'
    }
  },
  post: {
    'os-update': params => {
      console.log('calling os-update with', params)
      return {
        ...data.get['os-update'],
        ...params
      }
    }
  }
}

export default data
