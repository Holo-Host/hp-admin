import React from 'react'
import { fireEvent, act } from '@testing-library/react'
import { renderAndWait } from 'utils/test-utils'
import { BrowserRouter as Router } from 'react-router-dom'
import { MockedProvider } from '@apollo/react-testing'
import wait from 'waait'
import { AuthProvider } from 'contexts/useAuthContext'
import { FlashMessageProvider } from 'contexts/useFlashMessageContext'
import HPAdminRouter from 'HPAdminRouter'
import HposCheckAuthMutation from 'graphql/HposCheckAuthMutation.gql'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')
jest.unmock('react-router-dom')

const HPAdminApp = () =>
  <Router>
    <AuthProvider>
      <FlashMessageProvider>
        <HPAdminRouter />
      </FlashMessageProvider>
    </AuthProvider>
  </Router>

describe('login flow', () => {
  it.skip('redirects to "/admin/" on succesful auth', async () => {
    const mocks = [{
      request: {
        query: HposCheckAuthMutation,
        variables: { }
      },
      result: {
        data: {
          hposCheckAuth: {
            isAuthed: true
          }
        }
      }
    }]

    const email = 'a@example.com'
    const password = 'fkldsjf'
    const { getByLabelText, queryByLabelText, getByText } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
      <HPAdminApp />
    </MockedProvider>)

    await act(async () => {
      fireEvent.change(getByLabelText('Email:'), { target: { value: email } })
      fireEvent.change(getByLabelText('Password:'), { target: { value: password } })
      fireEvent.click(getByText('Login'))
      await wait(50)
    })

    // debug()

    expect(getByText('Hi!')).toBeInTheDocument()
    expect(queryByLabelText('Email:')).not.toBeInTheDocument()
  })

  it.skip('shows flash message on unsuccesful auth', async () => {
    const mocks = [{
      request: {
        query: HposCheckAuthMutation,
        variables: { }
      },
      result: {
        data: {
          hposCheckAuth: {
            isAuthed: false
          }
        }
      }
    }]

    const email = 'a@example.com'
    const password = 'fkldsjf'
    const { getByLabelText, getByText } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
      <HPAdminApp />
    </MockedProvider>)

    await act(async () => {
      fireEvent.change(getByLabelText('Email:'), { target: { value: email } })
      fireEvent.change(getByLabelText('Password:'), { target: { value: password } })
      fireEvent.click(getByText('Login'))
      await wait(50)
    })

    expect(getByText('Incorrect email or password. Please check and try again.')).toBeInTheDocument()
    expect(getByLabelText('Email:')).toBeInTheDocument()
  })
})
