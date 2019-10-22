const data = {
  get: {
    'os-update': {
      version: '1.2.3'
    }
  },
  post: {
    'os-update': params => {
      return {
        ...data.get['os-update'],
        ...params
      }
    }
  }
}

export default data
