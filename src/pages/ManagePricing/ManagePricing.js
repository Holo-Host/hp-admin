import React, { useState, useEffect } from 'react'
import './ManagePricing.module.css'
import Button from 'components/Button'
import Dropdown from 'react-dropdown'
import { UNITS } from 'models/HostPricing'

export default function ManagePricing ({ hostPricing, updateHostPricing, history: { push } }) {
  const goToMenu = () => push('/menu')

  const [units, setUnits] = useState('')
  const [fuelPerUnit, setFuelPerUnit] = useState('')

  useEffect(() => {
    if (!hostPricing) return
    const { units, fuelPerUnit } = hostPricing
    setUnits(units)
    setFuelPerUnit(fuelPerUnit)
  }, [hostPricing])

  const dropdownOptions = [
    { value: UNITS.cpu, label: `CPU = ${fuelPerUnit} HF per second` },
    { value: UNITS.bandwidth, label: `Bandwidth = ${fuelPerUnit} HF per KB` },
    { value: UNITS.storage, label: `Storage = ${fuelPerUnit} HF per MB` },
    { value: UNITS.ram, label: `RAM = ${fuelPerUnit} HF per MB` }
  ]

  const onFuelInputChange = ({ target: { value } }) => {
    if (isNaN(value)) return
    setFuelPerUnit(value)
  }

  const save = () => {
    updateHostPricing({ units, fuelPerUnit })
  }

  return <div styleName='container'>
    <div styleName='header'>
      <span styleName='title'>Manage Pricing</span>
      <Button onClick={goToMenu} styleName='menu-button'>Menu</Button>
    </div>

    <div styleName='subtitle'>Price Settings</div>

    <Dropdown
      options={dropdownOptions}
      onChange={({ value }) => setUnits(value)} value={units}
      styleName='unit-dropdown' />

    <div styleName='price-input-wrapper'>
      <label styleName='price-input-label'>
        Holofuel per unit
        <input type='text' value={fuelPerUnit} onChange={onFuelInputChange} styleName='price-input' />
      </label>
    </div>

    <div>
      <Button onClick={save}>Save</Button>
    </div>

  </div>
}
