import React from 'react'
import { render, fireEvent, within } from '@testing-library/react'
import { ApolloProvider } from 'react-apollo'
import apolloClient from 'apolloClient'
import ConnectedBrowseHapps from './index'
import { appOne as appHoloFuel, appTwo as appHylo } from 'mock-dnas/happStore'
import wait from 'waait'

describe('ConnectedBrowseHapps', () => {
  it('renders', async () => {
    const { getAllByRole } = render(<ApolloProvider client={apolloClient}>
      <ConnectedBrowseHapps history={{}} />
    </ApolloProvider>)
    await wait(15)
    const listItems = getAllByRole('listitem')
    expect(listItems).toHaveLength(2)

    const apps = [appHoloFuel, appHylo]

    listItems.forEach((item, index) => {
      const { getByText, queryByText } = within(item)
      expect(getByText(apps[index].appEntry.title)).toBeInTheDocument()
      expect(getByText(apps[index].appEntry.description)).toBeInTheDocument()
      if (index === 0) {
        expect(queryByText('Hosted')).toBeInTheDocument()
      }
      if (index === 1) {
        expect(queryByText('Hosted')).not.toBeInTheDocument()
      }
    })
  })

  describe('menu button', () => {
    it("calls history.push with '/menu'", async () => {
      const mockHistory = {
        push: jest.fn()
      }
      const { getByText } = render(<ApolloProvider client={apolloClient}>
        <ConnectedBrowseHapps history={mockHistory} />
      </ApolloProvider>)
      fireEvent.click(getByText('Menu'))
      expect(mockHistory.push).toHaveBeenCalledWith('/menu')
    })
  })
})
