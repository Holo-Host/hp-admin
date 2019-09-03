import React from 'react'
import moment from 'moment'

export function bgImageStyle (url) {
  if (!url) return {}
  const escaped = url.replace(/([\(\)])/g, (match, $1) => '\\' + $1) // eslint-disable-line
  return { backgroundImage: `url(${escaped})` }
}

export async function promiseMap (array, fn) {
  const resolvedArray = await array
  const promiseArray = resolvedArray.map(fn)
  const resolved = await Promise.all(promiseArray)
  return resolved
}

export function formatDateTime (isoDate) {
  return <React.Fragment>
    { parseInt(moment(isoDate).startOf('day').fromNow().split(' ')[0]) > 1
      ? <p>{ moment(isoDate).format('LLLL')}</p>
      : parseInt(moment(isoDate).startOf('hour').fromNow().split(' ')[0]) > 1
        ? <p>{moment(isoDate).calendar()}</p>
        : <p>{moment(isoDate).startOf('hour').fromNow()}</p>
    }
  </React.Fragment>
}

export const makeIsoStringDateTime = () => new Date().toISOString()
