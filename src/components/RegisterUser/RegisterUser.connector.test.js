import React from 'react'
import { render, act } from '@testing-library/react'
import { MockedProvider } from '@apollo/react-testing'
import wait from 'waait'
import HostingUserQuery from 'graphql/HostingUserQuery.gql'
import connector from './RegisterUser.connector'

const mockHostingUser = {
  id: 1,
  isRegistered: true
}

const mocks = [
  {
    request: {
      query: HostingUserQuery
    },
    result: {
      data: {
        hostingUser: mockHostingUser
      }
    }
  }
]

describe('connector', () => {
  it('runs the HostingUserQuery', async () => {
    let hostingUser

    const MockComponent = props => {
      hostingUser = props.hostingUser
      return null
    }

    const ConnectedMockComponent = connector(MockComponent)

    await act(async () => {
      render(<MockedProvider mocks={mocks} addTypename={false}>
        <ConnectedMockComponent />
      </MockedProvider>)
      await wait(1)
    })

    expect(hostingUser).toMatchObject(mockHostingUser)
  })
})
