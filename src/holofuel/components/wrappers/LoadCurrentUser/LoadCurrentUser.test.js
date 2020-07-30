import React from 'react'
import { MockedProvider } from '@apollo/react-testing'
import MyHolofuelUserQuery from 'graphql/MyHolofuelUserQuery.gql'
import { renderAndWait } from 'utils/test-utils'
import LoadCurrentUser from './LoadCurrentUser'
import { setCurrentUser as mockSetCurrentUser } from 'holofuel/contexts/useCurrentUserContext'

jest.mock('holofuel/contexts/useCurrentUserContext')

describe('LoadCurrentUser', () => {
  const myHolofuelUser = {
    id: 1,
    nickname: 'Alice',
    avatarUrl: ''
  }

  const myHolofuelUserMock = {
    request: {
      query: MyHolofuelUserQuery
    },
    result: {
      data: {
        myHolofuelUser
      }
    }
  }

  const mocks = [
    myHolofuelUserMock
  ]

  it('sets CurrentUserContext with the Holofuel User', async () => {
    await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
      <LoadCurrentUser />
    </MockedProvider>)

    expect(mockSetCurrentUser).toHaveBeenCalledWith(myHolofuelUser)
  })
})
