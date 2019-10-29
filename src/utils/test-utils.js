import React from 'react'
import { render, act } from '@testing-library/react'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { ApolloProvider } from '@apollo/react-hooks'
import apolloClient from 'apolloClient'
import wait from 'waait'

export async function renderAndWait (ui, ms = 0, options = {}) {
  let queries
  await act(async () => {
    queries = render(ui, options)
    await wait(ms)
  })
  return queries
}

export function renderWithApolloRouter (
  ui,
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] })
  } = {}
) {
  return {
    ...render(<Router history={history}>
      <ApolloProvider client={apolloClient}>
        {ui}
      </ApolloProvider>
    </Router>),
    history
  }
}

export async function renderWithApolloRouterAwait (ui, ms = 0) {
  let queries
  await act(async () => {
    queries = renderWithApolloRouter(ui)
    await wait(ms)
  })
  return queries
}
