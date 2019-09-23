import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import wait from 'waait'
import Login from './Login'

jest.mock('components/layout/PrimaryLayout')

describe('Login', () => {
  it('renders', async () => {
    const { getByPlaceholderText, getByText } = render(<Login history={{}} />)

    expect(getByPlaceholderText('Email address')).toBeInTheDocument()
    expect(getByPlaceholderText('Password')).toBeInTheDocument()
    expect(getByText('Login')).toBeInTheDocument()
  })

  describe('Validation', () => {
    it('redirects to dashboard with correct field input', async () => {
      const push = jest.fn()
      const email = 'a@example.com'
      const password = 'fkldsjf'
      const { getByPlaceholderText, getByText } = render(<Login history={{ push }} />)
      act(() => {
        fireEvent.change(getByPlaceholderText('Email address'), { target: { value: email } })
        fireEvent.change(getByPlaceholderText('Password'), { target: { value: password } })
      })

      fireEvent.click(getByText('Login'))
      await act(() => wait(0))

      expect(push).toHaveBeenCalledWith('/')
    })

    it('shows email error when no email is provided', async () => {
      const push = jest.fn()
      const password = 'fkldsjf'
      const { getByPlaceholderText, getByText } = render(<Login history={{ push }} />)
      act(() => {
        fireEvent.change(getByPlaceholderText('Email address'), { target: { value: '' } })
        fireEvent.change(getByPlaceholderText('Password'), { target: { value: password } })
      })

      fireEvent.click(getByText('Login'))
      await act(() => wait(0))

      expect(getByText('You need to provide a valid email address.')).toBeInTheDocument()
      expect(push).not.toHaveBeenCalled()
    })

    it('shows password required error when no password is provided', async () => {
      const push = jest.fn()
      const email = 'a@example.com'
      const { getByPlaceholderText, getByText } = render(<Login history={{ push }} />)
      act(() => {
        fireEvent.change(getByPlaceholderText('Email address'), { target: { value: email } })
        fireEvent.change(getByPlaceholderText('Password'), { target: { value: '' } })
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
      const { getByPlaceholderText, getByText } = render(<Login history={{ push }} />)
      act(() => {
        fireEvent.change(getByPlaceholderText('Email address'), { target: { value: email } })
        fireEvent.change(getByPlaceholderText('Password'), { target: { value: password } })
      })

      fireEvent.click(getByText('Login'))
      await act(() => wait(0))

      expect(getByText('Password need to be at least 6 characters long.')).toBeInTheDocument()
      expect(push).not.toHaveBeenCalled()
    })
  })
})
