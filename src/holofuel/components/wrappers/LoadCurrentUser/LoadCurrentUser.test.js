import React from 'react'
import { MockedProvider } from '@apollo/react-testing'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import { renderAndWait } from 'utils/test-utils'
import LoadCurrentUser from './LoadCurrentUser'

describe('LoadCurrentUser', () => {
  const holofuelUserMock = {
    request: {
      query: HolofuelUserQuery
    },
    result: {
      data: {
        holofuelUser: {
          id: 1,
          nickname: 'Alice',
          avatarUrl: ''
        }
      }
    }
  }

  const mocks = [
    holofuelUserMock
  ]

  it.skip('sets CurrentUserContext with the Holofuel User', async () => {
    await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
      <LoadCurrentUser />
    </MockedProvider>)
  })
})
