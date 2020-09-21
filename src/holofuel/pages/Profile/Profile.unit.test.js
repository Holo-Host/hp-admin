import React from 'react'
import { fireEvent, act } from '@testing-library/react'
import wait from 'waait'
import { MockedProvider } from '@apollo/react-testing'
import { ApolloProvider } from '@apollo/react-hooks'
import apolloClient from 'apolloClient'
import MyHolofuelUserQuery from 'graphql/MyHolofuelUserQuery.gql'
import HolofuelUpdateUserMutation from 'graphql/HolofuelUpdateUserMutation.gql'
import Profile from './Profile'
import { renderAndWait } from 'utils/test-utils'

jest.mock('holofuel/components/layout/PrimaryLayout')
jest.mock('holofuel/contexts/useFlashMessageContext')
jest.mock('holofuel/contexts/useCurrentUserContext')

describe('Rendering', () => {
  it('should render the Nickname input', async () => {
    const { getByLabelText } = await renderAndWait(<ApolloProvider client={apolloClient}><Profile /></ApolloProvider>, 1500)
    const input = getByLabelText('Nickname')

    expect(input).toBeInTheDocument()
  })

  it('should render the submit button', async () => {
    const { getByText } = await renderAndWait(<ApolloProvider client={apolloClient}><Profile /></ApolloProvider>, 1500)
    const button = getByText('Save Changes')

    expect(button).toBeInTheDocument()
  })
})

describe('Validation', () => {
  it('should reject empty name', async () => {
    const pushSpy = jest.fn()
    const { getByLabelText, getByText } = await renderAndWait(<ApolloProvider client={apolloClient}><Profile /></ApolloProvider>, 1500)

    const input = getByLabelText('Nickname')
    fireEvent.change(input, { target: { value: '' } })

    await act(async () => {
      fireEvent.click(getByText('Save Changes'))
      await wait(0)
    })

    const error = getByText('Name must be between 5 and 20 characters.')
    expect(error).toBeInTheDocument()
    expect(pushSpy).not.toHaveBeenCalled()
  })

  it('should not show error for name when provided', async () => {
    const { getByLabelText, getByText, queryByText } = await renderAndWait(<ApolloProvider client={apolloClient}><Profile /></ApolloProvider>, 1500)
    const input = getByLabelText('Nickname')
    fireEvent.change(input, { target: { value: 'Alice' } })

    await act(async () => {
      fireEvent.click(getByText('Save Changes'))
      await wait(0)
    })

    const error = queryByText('You need to set your Nickname.')
    expect(error).not.toBeInTheDocument()
  })
})

// TODO: Debug
describe('Save Profile Updates', () => {
  const mockProfile = {
    id: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
    nickname: 'Perry',
    avatarUrl: ''
  }

  const mockNickname = 'The HoloNaut'

  const myProfileMock = {
    request: {
      query: MyHolofuelUserQuery
    },
    result: {
      data: { myHolofuelUser: mockProfile }
    }
  }

  const updateMyProfileMock = {
    request: {
      query: HolofuelUpdateUserMutation,
      variables: { mockNickname, avatarUrl: '' }
    },
    result: {
      data: { holofuelRequest: mockProfile }
    }
  }

  it.skip('should accept the form when all required fields pass validation', async () => {
    const { getByLabelText, getByTestId, getByText } = await renderAndWait(<MockedProvider mocks={[myProfileMock, updateMyProfileMock]} addTypename={false}><Profile /></MockedProvider>, 1500)

    const nameImput = getByLabelText('Nickname')
    await act(async () => {
      fireEvent.change(nameImput, { target: { value: mockNickname } })
      await wait(0)
    })

    await act(async () => {
      fireEvent.click(getByText('Save Changes'))
      await wait(0)
    })

    expect(getByTestId('profile-nickname').value).toEqual(mockNickname)
  })
})
