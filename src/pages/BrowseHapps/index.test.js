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
      const { getByText } = within(item)
      expect(getByText(apps[index].appEntry.title)).toBeInTheDocument()
      expect(getByText(apps[index].appEntry.description)).toBeInTheDocument()
      if (index === 0) {
        expect(getByText('Un-Host')).toBeInTheDocument()
      }
      if (index === 1) {
        expect(getByText('Host')).toBeInTheDocument()
      }
    })
  })

  describe('HostButton', () => {
    it('enables and disables happs', async () => {
      const { getAllByRole, queryAllByText } = render(<ApolloProvider client={apolloClient}>
        <ConnectedBrowseHapps history={{}} />
      </ApolloProvider>)
      await wait(15)
      const listItems = getAllByRole('listitem')

      expect(queryAllByText('Un-Host')).toHaveLength(1)
      expect(queryAllByText('Host')).toHaveLength(1)

      const { getByText: getByTextFromListItem } = within(listItems[0])
      fireEvent.click(getByTextFromListItem('Un-Host'))

      await wait(0)

      expect(queryAllByText('Un-Host')).toHaveLength(0)
      expect(queryAllByText('Host')).toHaveLength(2)

      fireEvent.click(getByTextFromListItem('Host'))

      await wait(0)

      expect(queryAllByText('Un-Host')).toHaveLength(1)
      expect(queryAllByText('Host')).toHaveLength(1)
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
