import React from 'react'
import { fireEvent, wait } from '@testing-library/react'
import { renderAndWait } from 'utils/test-utils'
import { HPAdminApp } from 'root'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')

describe('BrowseHapps', () => {
  it('can install and uninstall happ', async () => {
    const { debug, getByTestId, getByText } = await renderAndWait(<HPAdminApp />)
    // navigate to BrowseHapps
    fireEvent.click(getByText('Hosting'))
    debug()
  }, 20000)
})
