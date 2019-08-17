import React from 'react'
import CloseIcon from 'utils/icons/CloseIcon'
import CheckMarkIcon from 'utils/icons/CheckMarkIcon'
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
  onChange,
  onCloseHandler,
  onCheckHandler
}) {
  return (
    <fieldset styleName='form-row'>
      {hasLabel && type !== 'checkbox' &&
        <div>
          <label
            html-for={htmlFor}
            data-for={dataFor}
            styleName='form-label'>
            {label}
          </label>
          <span
            onClick={() => onCheckHandler()}
            styleName='side-icon'>
            <CheckMarkIcon width={10} height={10} />
          </span>
          <span
            onClick={() => onCloseHandler()}
            styleName='side-icon'>
            <CloseIcon width={8} height={8} />
          </span>
        </div>
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
