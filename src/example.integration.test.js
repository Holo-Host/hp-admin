const Browser = require('zombie')

jest.mock('react-identicon-variety-pack')

Browser.localhost('example.com', 3100)

const browser = new Browser()

describe('the test', () => {
  beforeEach(() => browser.visit('/inbox'))

  it('passes', () => {
    browser.assert.success()
    browser.assert.text('#sub-title', 'Inbox (2)')
  })
})
