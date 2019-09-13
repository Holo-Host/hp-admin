import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import wait from 'waait'
import Tos from './Tos'

describe('Tos', () => {
  it('renders tos modal', () => {
    const { getByText } = render(<Tos history={{}} />)

    expect(getByText('Terms of Service')).toBeInTheDocument()
  })

  it('goes back to settings page on close', async () => {
    const push = jest.fn()
    const { getByText } = render(<Tos history={{ push }} />)

    fireEvent.click(getByText('Close'))
    await act(() => wait(0))

    expect(push).toHaveBeenCalledWith('/settings')
  })
})
