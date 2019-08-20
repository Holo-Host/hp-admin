import React from 'react'
import { render, fireEvent, within, act } from '@testing-library/react'
import { ApolloProvider } from '@apollo/react-hooks'
import apolloClient from 'apolloClient'
import BrowseHapps from './BrowseHapps'
import { appOne as appHoloFuel, appTwo as appHylo } from 'mock-dnas/happStore'
import wait from 'waait'

describe('BrowseHapps Connected', () => {
  it('renders', async () => {
    let getAllByRole
    await act(async () => {
      ({ getAllByRole } = render(<ApolloProvider client={apolloClient}>
        <BrowseHapps history={{}} />
      </ApolloProvider>))
      await wait(15)
    })

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
      let getAllByRole, queryAllByText
      await act(async () => {
        ({ getAllByRole, queryAllByText } = render(<ApolloProvider client={apolloClient}>
          <BrowseHapps history={{}} />
        </ApolloProvider>))
        await wait(15)
      })

      const listItems = getAllByRole('listitem')
      expect(queryAllByText('Un-Host')).toHaveLength(1)
      expect(queryAllByText('Host')).toHaveLength(1)

      const { getByText: getByTextFromListItem } = within(listItems[0])
      fireEvent.click(getByTextFromListItem('Un-Host'))

      await act(() => wait(0))

      expect(queryAllByText('Un-Host')).toHaveLength(0)
      expect(queryAllByText('Host')).toHaveLength(2)

      fireEvent.click(getByTextFromListItem('Host'))

      await act(() => wait(0))

      expect(queryAllByText('Un-Host')).toHaveLength(1)
      expect(queryAllByText('Host')).toHaveLength(1)
    })
  })
})
