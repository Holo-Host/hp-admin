import React from 'react'
import { MockedProvider } from '@apollo/react-testing'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import { renderAndWait } from 'utils/test-utils'
import LoadCurrentUser from './LoadCurrentUser'
import { setCurrentUser as mockSetCurrentUser } from 'holofuel/contexts/useCurrentUserContext'

jest.mock('holofuel/contexts/useCurrentUserContext')

describe('LoadCurrentUser', () => {
  const holofuelUser = {
    id: 1,
    nickname: 'Alice',
    avatarUrl: ''
  }

  const holofuelUserMock = {
    request: {
      query: HolofuelUserQuery
    },
    result: {
      data: {
        holofuelUser
      }
    }
  }

  const mocks = [
    holofuelUserMock
  ]

  it('sets CurrentUserContext with the Holofuel User', async () => {
    await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
      <LoadCurrentUser />
    </MockedProvider>)

    expect(mockSetCurrentUser).toHaveBeenCalledWith(holofuelUser)
  })
})
