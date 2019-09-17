import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import wait from 'waait'
import Tos from './Tos'

const renderTos = (
  ui,
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] })
  } = {}
) => ({
  ...render(
    <Router history={history}>
      {ui}
    </Router>
  ),
  history
})

describe('Tos', () => {
  it('renders tos modal', () => {
    const { getByText } = renderTos(<Tos history={{}} />)

    expect(getByText('Terms of Service')).toBeInTheDocument()
  })

  it('goes back to settings page on close', async () => {
    const push = jest.fn()
    const { getByText } = renderTos(<Tos history={{ push }} />)

    fireEvent.click(getByText('Close'))
    await act(() => wait(0))

    expect(push).toHaveBeenCalledWith('/settings')
  })
})
