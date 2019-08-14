import React from 'react'
import './FormInput.module.css'

export default function FormInput ({
  hasLabel,
  htmlFor,
  label,
  min,
  max,
  name,
  step,
  placeholder,
  required,
  type,
  dataFor,
  checked,
  value,
  onChange
}) {
  return (
    <fieldset styleName='form-row'>
      {hasLabel && type !== 'checkbox' &&
        <label
          html-for={htmlFor}
          data-for={dataFor}
          styleName='form-label'>
          {label}
        </label>
      }

      {type === 'text' &&
        <input
          type={type}
          id={htmlFor}
          max={max || null}
          min={min || null}
          name={name || null}
          step={step || null}
          placeholder={placeholder || null}
          required={required || null}
          value={value}
          onChange={onChange}
        />
      }

      {type === 'checkbox' &&
        <label
          label={label}
          html-for={htmlFor}
          data-for={dataFor}
          styleName='form-label'>
          <input
            type={type}
            checked={checked}
            id={htmlFor}
            name={name || null}
            required={required || null}
            styleName='checkbox'
            onChange={onChange}
          />
          {label}
        </label>
      }
    </fieldset>
  )
}
