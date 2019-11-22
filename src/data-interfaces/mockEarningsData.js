import { UNITS } from 'models/HostPricing'

// this data is a placeholder for whatever magic we use to extract the earnings from the holofuel transactions

const staticEarnings = [{
  id: 1,
  timestamp: '2019-08-30T22:20:25.106Z',
  amount: 123,
  pricePerUnit: 5,
  units: UNITS.cpu,
  happName: 'Community'
},
{
  id: 2,
  timestamp: '2019-08-30T18:20:25.106Z',
  amount: 150,
  pricePerUnit: 15,
  units: UNITS.storage,
  happName: 'HoloFuel'
},
{
  id: 3,
  timestamp: '2019-08-30T14:20:25.106Z',
  amount: 80,
  pricePerUnit: 10,
  units: UNITS.bandwidth,
  happName: 'Personas'
},
{
  id: 4,
  timestamp: '2019-08-29T14:20:25.106Z',
  amount: 80,
  pricePerUnit: 10,
  units: UNITS.bandwidth,
  happName: 'Personas'
},
{
  id: 5,
  timestamp: '2019-08-28T14:20:25.106Z',
  amount: 343,
  pricePerUnit: 50,
  units: UNITS.cpu,
  happName: 'HoloFuel'
},
{
  id: 6,
  timestamp: '2019-08-27T14:20:25.106Z',
  amount: 123,
  pricePerUnit: 1,
  units: UNITS.ram,
  happName: 'Personas'
},
{
  id: 7,
  timestamp: '2019-08-26T14:20:25.106Z',
  amount: 10,
  pricePerUnit: 10,
  units: UNITS.bandwidth,
  happName: 'HoloFuel'
},
{
  id: 8,
  timestamp: '2019-08-26T12:20:25.106Z',
  amount: 389,
  pricePerUnit: 5,
  units: UNITS.cpu,
  happName: 'Community'
},
{
  id: 9,
  timestamp: '2019-08-26T10:20:25.106Z',
  amount: 45,
  pricePerUnit: 10,
  units: UNITS.bandwidth,
  happName: 'Personas'
},
{
  id: 10,
  timestamp: '2019-08-25T14:20:25.106Z',
  amount: 920,
  pricePerUnit: 15,
  units: UNITS.storage,
  happName: 'HoloFuel'
},
{
  id: 11,
  timestamp: '2019-08-19T14:20:25.106Z',
  amount: 56,
  pricePerUnit: 100,
  units: UNITS.cpu,
  happName: 'HoloFuel'
},
{
  id: 12,
  timestamp: '2019-08-18T14:20:25.106Z',
  amount: 805,
  pricePerUnit: 20,
  units: UNITS.bandwidth,
  happName: 'Community'
},
{
  id: 13,
  timestamp: '2019-08-17T14:20:25.106Z',
  amount: 10,
  pricePerUnit: 25,
  units: UNITS.ram,
  happName: 'HoloFuel'
},
{
  id: 14,
  timestamp: '2019-08-16T14:20:25.106Z',
  amount: 734,
  pricePerUnit: 200,
  units: UNITS.storage,
  happName: 'Personas'
},
{
  id: 15,
  timestamp: '2019-08-16T12:20:25.106Z',
  amount: 200,
  pricePerUnit: 3,
  units: UNITS.cpu,
  happName: 'Personas'
},
{
  id: 16,
  timestamp: '2019-08-16T10:20:25.106Z',
  amount: 505,
  pricePerUnit: 11,
  units: UNITS.bandwidth,
  happName: 'Community'
},
{
  id: 17,
  timestamp: '2019-08-15T14:20:25.106Z',
  amount: 438,
  pricePerUnit: 35,
  units: UNITS.bandwidth,
  happName: 'HoloFuel'
}]

const now = (new Date()).getTime()
const thirtyDays = 30 * 24 * 60 * 60 * 1000

const dynamicEarnings = Array.from({ length: 200 }, (_, id) => ({
  id,
  timestamp: new Date(now - Math.floor(Math.random() * thirtyDays)).toISOString(),
  amount: Math.floor(Math.random() * 1000),
  pricePerUnit: 5,
  units: UNITS.cpu,
  happName: ['Community', 'Holofuel'][Math.floor(Math.random() * 2)]
})).sort((a, b) => a.timestamp < b.timestamp ? 1 : -1)

const mockEarnings = process.env.NODE_ENV === 'test' ? staticEarnings : dynamicEarnings

export default mockEarnings
