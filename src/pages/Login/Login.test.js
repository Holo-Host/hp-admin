import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import wait from 'waait'
import { MockedProvider } from '@apollo/react-testing'
import Login from './Login'

jest.mock('components/layout/PrimaryLayout')
jest.mock('contexts/useConnectionContext')
jest.mock('contexts/useAuthContext')
jest.mock('contexts/useCurrentUserContext')
jest.mock('contexts/useConnectionContext')
jest.mock('contexts/useFlashMessageContext')

describe('Login', () => {
  it('renders', async () => {
    const { getByLabelText, getByText, queryByTestId } = render(<MockedProvider><Login history={{}} /></MockedProvider>)

    expect(getByLabelText('Email:')).toBeInTheDocument()
    expect(getByLabelText('Password:')).toBeInTheDocument()
    expect(getByText('Login')).toBeInTheDocument()
    expect(queryByTestId('menu-button')).not.toBeInTheDocument()
  })

  it('renders UI Version number', () => {
    const { getByText } = render(<MockedProvider><Login history={{}} /></MockedProvider>)
    const versionText = `UI v${process.env.REACT_APP_VERSION}`
    expect(getByText(versionText)).toBeInTheDocument()
  })

  describe('Validation', () => {
    it.skip('redirects to dashboard with correct field input', async () => {
      const push = jest.fn()
      const email = 'a@example.com'
      const password = 'fkldsjf'
      const { getByLabelText, getByText } = render(<Login history={{ push }} />)
      act(() => {
        fireEvent.change(getByLabelText('Email:'), { target: { value: email } })
        fireEvent.change(getByLabelText('Password:'), { target: { value: password } })
      })

      fireEvent.click(getByText('Login'))
      await act(() => wait(0))

      expect(push).toHaveBeenCalledWith('/')
    })

    it('shows email error when no email is provided', async () => {
      const push = jest.fn()
      const password = 'fkldsjf'
      const { getByLabelText, getByText } = render(<MockedProvider><Login history={{ push }} /></MockedProvider>)
      act(() => {
        fireEvent.change(getByLabelText('Email:'), { target: { value: '' } })
        fireEvent.change(getByLabelText('Password:'), { target: { value: password } })
      })

      fireEvent.click(getByText('Login'))
      await act(() => wait(0))

      expect(getByText('You need to provide a valid email address.')).toBeInTheDocument()
      expect(push).not.toHaveBeenCalled()
    })

    it('shows password required error when no password is provided', async () => {
      const push = jest.fn()
      const email = 'a@example.com'
      const { getByLabelText, getByText } = render(<MockedProvider><Login history={{ push }} /></MockedProvider>)
      act(() => {
        fireEvent.change(getByLabelText('Email:'), { target: { value: email } })
        fireEvent.change(getByLabelText('Password:'), { target: { value: '' } })
      })

      fireEvent.click(getByText('Login'))
      await act(() => wait(0))

      expect(getByText('Type in your password, please.')).toBeInTheDocument()
      expect(push).not.toHaveBeenCalled()
    })

    it('shows password too short error when provided with too short password', async () => {
      const push = jest.fn()
      const email = 'a@example.com'
      const password = 'short'
      const { getByLabelText, getByText } = render(<MockedProvider><Login history={{ push }} /></MockedProvider>)
      act(() => {
        fireEvent.change(getByLabelText('Email:'), { target: { value: email } })
        fireEvent.change(getByLabelText('Password:'), { target: { value: password } })
      })

      fireEvent.click(getByText('Login'))
      await act(() => wait(0))

      expect(getByText('Password need to be at least 6 characters long.')).toBeInTheDocument()
      expect(push).not.toHaveBeenCalled()
    })
  })
})
