import React from 'react'
import { fireEvent, act } from '@testing-library/react'
import wait from 'waait'
import { ApolloProvider } from '@apollo/react-hooks'
import apolloClient from 'apolloClient'
import Profile from './Profile'
import { renderAndWait } from 'utils/test-utils'

jest.mock('holofuel/components/layout/PrimaryLayout')
jest.mock('holofuel/contexts/useFlashMessageContext')

describe('Rendering', () => {
  it('should render the avatarUrl input', async () => {
    const { getByLabelText } = await renderAndWait(<ApolloProvider client={apolloClient}><Profile /></ApolloProvider>, 1500)
    const input = getByLabelText('Avatar URL')

    expect(input).toBeInTheDocument()
  })

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

    const error = getByText('You need to set your name.')
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

  it('should accept the form when all required fields pass validation', async () => {
    const pushSpy = jest.fn()
    const { getByLabelText, getByText } = await renderAndWait(<ApolloProvider client={apolloClient}><Profile /></ApolloProvider>, 1500)

    const nameImput = getByLabelText('Nickname')
    await act(async () => {
      fireEvent.change(nameImput, { target: { value: 'Alice' } })
      await wait(0)
    })

    await act(async () => {
      fireEvent.click(getByText('Save Changes'))
      await wait(0)
    })

    expect(pushSpy).toHaveBeenCalled()
  })
})
