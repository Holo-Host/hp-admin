// currently ignores instance id, so if you want to support mocking calls to multiple instance in one test, this will have to be extended
// currently ignores arguments to the zome call, so if you want to support returning different results with different arguments, this will have to be extended

var mockZomeCallResults = {}

export function instanceCreateZomeCall () {
  return partialZomeCallPath => () => Promise.resolve(mockZomeCallResults[partialZomeCallPath])
}

export function setMockZomeCallResults (results) {
  mockZomeCallResults = results
}
