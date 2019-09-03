import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import wait from 'waait'
import Login from './Login'

// mocking Header because it depends on Router
jest.mock('components/Header')

describe('Login', () => {
  it('renders', async () => {
    const { getByPlaceholderText, getByText } = render(<Login history={{}} />)

    expect(getByPlaceholderText('Email address')).toBeInTheDocument()
    expect(getByPlaceholderText('Password')).toBeInTheDocument()
    expect(getByText('Login')).toBeInTheDocument()
  })

  describe('on filling out form and pressing login button', () => {
    it('redirects to dashboard', async () => {
      const push = jest.fn()
      const email = 'a@b.com'
      const password = 'fkldsjf'

      const { getByPlaceholderText, getByText } = render(<Login history={{ push }} />)

      act(() => {
        fireEvent.change(getByPlaceholderText('Email address'), { target: { value: email } })
        fireEvent.change(getByPlaceholderText('Password'), { target: { value: password } })
        fireEvent.click(getByText('Login'))
      })

      await act(() => wait(0))

      expect(push).toHaveBeenCalledWith('/')
    })
  })
})
