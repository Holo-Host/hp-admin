import { invert, isArray } from 'lodash/fp'

// Data mapping, interface <> Hylo UI
export const interfaceDefaultAttribsMap = () => ({
})

const uiDefaultAttribsMap = () => ({
})

export const toInterfaceKeyMap = {
  global: {
    createdAt: 'timestamp',
    id: 'address',
    avatarUrl: 'avatar_url'
  },
  person: {
    id: 'agent_id'
  }
}

export const toUiKeyMap = {}
for (const key in toInterfaceKeyMap) {
  toUiKeyMap[key] = invert(toInterfaceKeyMap[key])
}

export const createDataRemapper = initialDataMap => (type, data) => {
  const clonedData = Object.assign({}, data)
  const dataMapForType = type in initialDataMap
    ? initialDataMap[type]
    : {}
  const dataMap = Object.assign({}, initialDataMap['global'], dataMapForType)
  const remappedData = {}

  for (const key in data) {
    const mappedKey = key in dataMap
      ? dataMap[key]
      : key
    remappedData[mappedKey] = data[key]
    // TODO: Mutating passed object. Used a cloned copy or do another way
    delete clonedData[key]
  }

  return {
    ...clonedData,
    ...remappedData
  }
}

export const toInterfaceData = (...args) => {
  if (typeof args[1] !== 'object' || isArray(args[1])) return args[1]

  const results = createDataRemapper(toInterfaceKeyMap)(...args)

  return {
    ...interfaceDefaultAttribsMap()[args[0]],
    ...results
  }
}

export const toUiData = (...args) => {
  const results = createDataRemapper(toUiKeyMap)(...args)

  return {
    ...uiDefaultAttribsMap()[args[0]],
    ...results
  }
}

export const toUiQuerySet = results => ({
  total: results.length,
  items: results,
  hasMore: false
})

export async function dataMappedCall (entityType, inputData, interfaceFunc) {
  const interfaceData = toInterfaceData(entityType, inputData)
  const interfaceResult = await interfaceFunc(interfaceData)

  return toUiData(entityType, interfaceResult)
}
