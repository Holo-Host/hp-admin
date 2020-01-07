import moment from 'moment'
import { flow, groupBy, keys, sortBy, reverse } from 'lodash/fp'

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

export function sliceHash (hashString = '', desiredLength = 6) {
  if (typeof desiredLength !== 'number') throw new Error('Fn sliceHash requires a number input.')
  return (hashString).slice(-desiredLength)
}

export function presentAgentId (agentId) {
  return sliceHash(agentId, 6)
}

export function presentHolofuelAmount (amount) {
  const hasTrailingDot = /\.$/.test(amount)
  const parsed = Number.parseFloat(amount).toLocaleString()
  if (hasTrailingDot) {
    return parsed + '.'
  } else {
    return parsed
  }
}

export function presentDateAndTime (dateTime) {
  const momentDateTime = moment(dateTime)
  const date = momentDateTime.format('MMM D YYYY')
  const time = momentDateTime.utc().format('kk:mm UTC')
  return { date, time }
}

export function getDateLabel (timestamp) {
  const now = moment()
  const today = now.clone().startOf('day')
  const yesterday = now.clone().subtract(1, 'days').startOf('day')

  const isToday = momentDate => momentDate.isSame(today, 'd')
  const isYesterday = momentDate => momentDate.isSame(yesterday, 'd')

  const momentDate = moment(timestamp)

  if (isToday(momentDate)) return 'Today'
  if (isYesterday(momentDate)) return 'Yesterday'
  return momentDate.format('MMMM Do')
}

// returns an array of objects of the form { label, transactions }, sorted chronologicaly
export const partitionByDate = flow(
  groupBy(({ timestamp }) => getDateLabel(timestamp)),
  groups => {
    const labels = keys(groups)
    return labels.map(label => ({
      transactions: groups[label],
      label
    }))
  },
  sortBy(partition => partition.transactions[0].timestamp),
  reverse)

// parking this here. Not currently used.
function formatDateTime (isoDate) { // eslint-disable-line no-unused-vars
  const dateDifference = moment(isoDate).fromNow()
  // If over a year ago, include the year in date
  if (dateDifference.split(' ')[1] === 'years' || dateDifference.split(' ')[1] === 'year') {
    return {
      date: moment(isoDate).format('MMMM D YYYY'),
      time: moment(isoDate).format('kk:mm')
    }
  // If over a week ago, include the month and day in date
  } else if (
    dateDifference.split(' ')[1] === 'months' || dateDifference.split(' ')[1] === 'month' ||
    (dateDifference.split(' ')[1] === 'days' && parseInt(dateDifference.split(' ')[0]) >= 7)) {
    return {
      date: moment(isoDate).format('MMMM D'),
      time: moment(isoDate).format('kk:mm')
    }
  // If within a week ago, state days lapsed in date
  } else if (dateDifference.split(' ')[1] === 'days' && parseInt(dateDifference.split(' ')[0]) >= 1) {
    return {
      date: dateDifference,
      time: moment(isoDate).format('kk:mm')
    }
  // If less than a day ago, state hours, minutes, or seconds lapsed in time
  } else if (
    dateDifference.split(' ')[1] === 'hours' || dateDifference.split(' ')[1] === 'hour' ||
    dateDifference.split(' ')[1] === 'minutes' || dateDifference.split(' ')[1] === 'minute' ||
    dateDifference.split(' ')[2] === 'seconds' || dateDifference.split(' ')[1] === 'second') {
    return {
      date: 'Today',
      time: moment(isoDate).fromNow()
    }
    // Throw Error, iso-timedate cannot be parsed into valid format
  } else throw new Error('Iso timedate is unable to be parsed.', isoDate)
}
