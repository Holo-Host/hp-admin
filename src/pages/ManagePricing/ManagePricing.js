import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import './ManagePricing.module.css'
import PrimaryLayout from 'components/layout/PrimaryLayout'
import Button from 'components/Button'
import Input from 'components/Input'
import { UNITS } from 'models/HostPricing'
import HostPricingQuery from 'graphql/HostPricingQuery.gql'
import UpdateHostPricingMutation from 'graphql/UpdateHostPricingMutation.gql'

export default function ManagePricing () {
  const { data: { hostPricing } = {} } = useQuery(HostPricingQuery)
  const [updateHostPricing, { loading }] = useMutation(UpdateHostPricingMutation)

  const [units, setUnits] = useState('')
  const [pricePerUnit, setPricePerUnit] = useState('')
  const [changed, setChanged] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!hostPricing) return
    const { units, pricePerUnit } = hostPricing
    setUnits(units)
    setPricePerUnit(pricePerUnit)
  }, [hostPricing])

  const dropdownOptions = [
    { value: UNITS.cpu, label: `CPU (MS)` },
    { value: UNITS.bandwidth, label: `Bandwidth (MB)` },
    { value: UNITS.storage, label: `Storage (MB)` },
    { value: UNITS.ram, label: `RAM (MB)` }
  ]

  const onFuelInputChange = ({ target: { value } }) => {
    setChanged(true)
    setSaved(false)
    setPricePerUnit(value)
  }

  const onUnitsChange = ({ target: { value } }) => {
    setChanged(true)
    setSaved(false)
    setUnits(value)
  }

  const save = () => {
    setChanged(false)
    setSaved(true)
    updateHostPricing({ variables: { units, pricePerUnit } })
  }

  return <PrimaryLayout
    headerProps={{
      title: 'Manage Pricing',
      backTo: '/browse-happs'
    }}
  >
    <div styleName='inputs'>
      <Input type='number' value={pricePerUnit} onChange={onFuelInputChange} styleName='price-input' data-testid='price-input' />
      <span styleName='connecting-label'>HoloFuel per</span>
      <select styleName='units-dropdown'
        value={units}
        onChange={onUnitsChange}
        data-testid='units-dropdown'>
        {dropdownOptions.map(({ value, label }) =>
          <option value={value} key={value}>
            {label}
          </option>)}
      </select>
    </div>

    <Button styleName='save-button' wide variant='primary' onClick={save} disabled={loading || saved || !changed}>
      {loading ? 'Saving' : (saved ? 'Saved' : 'Save')}
    </Button>
  </PrimaryLayout>
}
