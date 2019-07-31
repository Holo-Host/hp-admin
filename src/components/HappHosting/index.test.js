import React from 'react'
import { render } from '@testing-library/react'
import { ApolloProvider } from 'react-apollo'
import apolloClient from 'apolloClient'
import ConnectedHappHosting from './index'
import wait from 'waait'

describe('ConnectedHappHosting', () => {
  it('renders', async () => {
    const { getByText, getAllByText } = render(<ApolloProvider client={apolloClient}>
      <ConnectedHappHosting />
    </ApolloProvider>)
    await wait(25)
    expect(getByText('Holofuel')).toBeTruthy()
    expect(getByText('Holo Community')).toBeTruthy()
    expect(getAllByText('Home Page').length).toEqual(2)
  })
})
