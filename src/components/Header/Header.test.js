import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import wait from 'waait'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { ApolloProvider } from '@apollo/react-hooks'
import apolloClient from 'apolloClient'

// testing the named export Header rather than the default export which is wrapped in withRouter
import { Header } from './Header'
import { title as menuIconTitle } from 'components/icons/MenuIcon'

jest.mock('contexts/useAuthTokenContext')
// TODO: switch to mock pattern for Router
jest.unmock('react-router-dom')

const renderHeader = (
  props,
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] })
  } = {}
) => ({
  ...render(
    <Router history={history}>
      <ApolloProvider client={apolloClient}>
        <Header {...props} />
      </ApolloProvider>
    </Router>
  ),
  history
})

it('should render the title and a menu icon', async () => {
  const props = {
    title: 'the title',
    history: { push: jest.fn() }
  }

  let getByText, getByTestId
  await act(async () => {
    ({ getByText, getByTestId } = renderHeader(props))
    await wait(0)
  })

  expect(getByText(props.title)).toBeInTheDocument()
  expect(getByText(menuIconTitle)).toBeInTheDocument()

  fireEvent.click(getByTestId('menu-button'))

  expect(props.history.push).toHaveBeenCalledWith('/dashboard')
})