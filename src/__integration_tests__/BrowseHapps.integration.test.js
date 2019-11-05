import React from 'react'
import { fireEvent, within, wait } from '@testing-library/react'
import { renderAndWait } from 'utils/test-utils'
import { HPAdminApp } from 'root'
import runConductor from 'utils/integration-testing/runConductorWithFixtures'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')
jest.unmock('react-router-dom')

// TODO : Update to pull data straight from pre-seed happ-data source. (NB: The app list below is a copy...)
const apps = [{
  happ1: {
    title: 'HoloFuel',
    description: 'Manage and redeem payments for hosting',
    thumbnail_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2cMFvYqaw7TtcTkPFcwE8pupKWqLFMCFu2opap9jqUoqIcAKB',
    homepage_url: 'about-holofuel.com',
    ui: {
      location: 'https://github.com/Holo-Host/holofuel-gui/releases/download/v0.1.0-alpha1-hc/master-ui.zip',
      hash: 'HoloFuelUIMockHash',
      handle: 'holofuel-holo-ui'
    },
    dna: [{
      location: 'https://holo-artifacts.s3-us-west-2.amazonaws.com/holofuel-v0.8.5-alpha1.dna.json',
      hash: 'QmcqAKFLP6WrjWghWVzrgnoa72EWu211C7Fu2F1FwRMU1k',
      handle: 'holofuel-holo'
    }],
    domain: {
      dns_name: 'hf-client-facing.domain.xyz'
    }
  }
},
{
  happ2: {
    title: 'Holo Community',
    description: 'Connect with other hosts in the Holo network',
    thumbnail_url: 'https://d3ngex8q79bk55.cloudfront.net/misc/default_community_avatar.png',
    homepage_url: 'about-holo-community.com',
    ui: {
      location: 'https://github.com/holochain/hylo-holo-dnas/archive/0.0.16-test.zip',
      hash: 'HyloUIMockHash',
      handle: 'holo-community-holo-ui'
    },
    dna: [{
      location: 'https://github.com/holochain/hylo-holo-dnas/archive/0.0.16-test.zip',
      hash: 'QmQHb3XZeV4YMnCrajrngo9mbgaVqndoGY1cuuqhh1aeTq',
      handle: 'holo-community-holo'
    }],
    domain: {
      dns_name: 'holo-community-client-facing.domain.xyz'
    }
  }
}]

// TODO: Setup seed data in such that two happs are available for hosting...
describe('HP Admin : BrowseHapps', () => {
  it('User navigates to Hosting Page, adds a happ to host, & manages pricing', runConductor(async () => {
    const { getByTestId, getAllByRole, getByText } = await renderAndWait(<HPAdminApp />)
    // navigate to hosting page
    fireEvent.click(getByTestId('menu-button'))
    await wait(() => getByText('Hosting'))
    fireEvent.click(getByText('Hosting'))

    await wait(() => getByText('Hosting'))
    await wait(() => getByText('HoloFuel'))
    await wait(() => getByText('Holo Community'))

    // confirm dna content display
    const listItems = getAllByRole('listitem')
    expect(listItems).toHaveLength(2)

    listItems.forEach((item, index) => {
      const { getByText } = within(item)
      expect(getByText(apps[index].title)).toBeInTheDocument()
      expect(getByText(apps[index].description)).toBeInTheDocument()
      expect(getByText('Host')).toBeInTheDocument()

      // host the happ
      fireEvent.click(getByText('Host'))
      expect(getByText('Un-Host')).toBeInTheDocument()
    })

    // update the pricing options
    await wait(() => getByText('Manage Pricing'))
    fireEvent.change(getByTestId('price-input'), { target: { value: 10 } })
    fireEvent.change(getByTestId('units-dropdown'), { target: { value: 'cpu' } })
    fireEvent.click(getByText('Save'))

    // navigate back to home dashboard
    fireEvent.click(getByTestId('menu-button'))
    await wait(() => getByText('Home'))
    fireEvent.click(getByText('Home'))

    // confirm that dashboard reflects the updated # of hosted happs
    await wait(() => getByText('My HoloPort'))
    const hostedHapps = await wait(() => getByTestId('hosted-apps'))
    expect(hostedHapps).toEqual('2 Applications')
  }), 150000)
})
