import { render, act } from '@testing-library/react'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import wait from 'waait'

export async function renderAndWait (ui, ms = 0, options = {}) {
  let queries
  await act(async () => {
    queries = render(ui, options)
    await wait(ms)
  })
  return queries
}

export const renderAndWaitWithRouter = async (ui, ms = 0, options = {}) => {
  let queries
  await act(async () => {
    queries = renderWithRouter(ui, options)
    await wait(ms)
  })
  return queries
}

export const renderWithRouter = (
  ui,
  options = {},
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
