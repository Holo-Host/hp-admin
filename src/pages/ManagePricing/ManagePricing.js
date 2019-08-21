import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import './ManagePricing.module.css'
import Button from 'components/Button'
import { UNITS } from 'models/HostPricing'
import HostPricingQuery from 'graphql/HostPricingQuery.gql'
import UpdateHostPricingMutation from 'graphql/UpdateHostPricingMutation.gql'

export default function ManagePricing ({ history: { push } }) {
  const { data: { hostPricing } } = useQuery(HostPricingQuery)
  const [updateHostPricing, { loading }] = useMutation(UpdateHostPricingMutation)
  const goToMenu = () => push('/menu')

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
    { value: UNITS.cpu, label: `CPU = ${pricePerUnit} HF per second` },
    { value: UNITS.bandwidth, label: `Bandwidth = ${pricePerUnit} HF per KB` },
    { value: UNITS.storage, label: `Storage = ${pricePerUnit} HF per MB` },
    { value: UNITS.ram, label: `RAM = ${pricePerUnit} HF per MB` }
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

  return <div styleName='container'>
    <div styleName='header'>
      <span styleName='title'>Manage Pricing</span>
      <Button onClick={goToMenu} styleName='menu-button'>Menu</Button>
    </div>

    <div styleName='subtitle'>Price Settings</div>

    <div styleName='units-dropdown'>
      <select value={units}
        onChange={onUnitsChange}
        data-testid='units-dropdown'>
        {dropdownOptions.map(({ value, label }) =>
          <option value={value} key={value}>
            {label}
          </option>)}
      </select>
    </div>

    <div styleName='price-input-wrapper'>
      <label styleName='price-input-label'>
        HoloFuel per unit
        <input type='number' value={pricePerUnit} onChange={onFuelInputChange} styleName='price-input' />
      </label>
    </div>

    <div>
      <Button onClick={save} disabled={loading || saved || !changed}>
        {loading ? 'Saving' : (saved ? 'Saved' : 'Save')}
      </Button>
    </div>
  </div>
}
