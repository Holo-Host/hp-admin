import React from 'react'
import { runConductor } from 'utils/runConductor.js'
import { fireEvent } from '@testing-library/react'
import { renderAndWait } from 'utils/test-utils'
import { ApolloProvider } from '@apollo/react-hooks'
import apolloClient from 'apolloClient'
import { mockNavigateTo } from 'react-router-dom'
import Dashboard from 'pages/Dashboard'
// import { id } from 'utils/agentConfig'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')

const runScenario = () => {
  describe('TESTING => Hosting Navigation Integration Test', () => {
    it('User can successfully navigate from Dashboard to Hosting Page', async () => {
      const { getByText } = await renderAndWait(<ApolloProvider client={apolloClient}>
        <Dashboard />
      </ApolloProvider>, 0)

      const hosting = getByText('+ Host your first app')
      expect(hosting).toBeInTheDocument()

      fireEvent.click(hosting)
      expect(mockNavigateTo).toHaveBeenCalledWith('/browse-happs')
    }, 20000)
  })
}

runConductor(runScenario)
