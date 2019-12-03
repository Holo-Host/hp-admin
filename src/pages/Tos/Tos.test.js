import React from 'react'
import Modal from 'react-modal'
import { render, fireEvent, act } from '@testing-library/react'
import wait from 'waait'
import Tos from './Tos'

jest.mock('components/layout/PrimaryLayout')

describe('Tos', () => {
  it('renders tos modal', () => {
    const { container, getByText } = render(<Tos history={{}} />)
    Modal.setAppElement(container)

    expect(getByText('Terms of Service')).toBeInTheDocument()
  })

  it('goes back to settings page on close', async () => {
    const push = jest.fn()
    const { container, getByText } = render(<Tos history={{ push }} />)
    Modal.setAppElement(container)

    fireEvent.click(getByText('Close'))
    await act(() => wait(0))

    expect(push).toHaveBeenCalledWith('/settings')
  })
})
