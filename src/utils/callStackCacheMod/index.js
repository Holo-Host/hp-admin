import { isEqual, pull } from 'lodash/fp'

const cachedInProcessCallStack = []

export const ADD_CALL = 'add'
export const REMOVE_CALL = 'remove'
export const formCachedApiAddress = (dnaInstance = '', zome = '', zomeFn = '') => (dnaInstance + '/' + zome + '/' + zomeFn)
export const formCachedZomeCall = (call = '', args = {}) => ({ call, args })
export const updateInProcessCallStackCache = (zomeCall, updateFn) => {
  if(updateFn === ADD_CALL) {
    cachedInProcessCallStack.push(zomeCall)
  } else if (updateFn === REMOVE_CALL) {
    pull(zomeCall, cachedInProcessCallStack)
  }
  return cachedInProcessCallStack
}
export const isCallInCache = ({ call, args }) => {
  for(let cacheZomeCall of cachedInProcessCallStack){   
    if (isEqual(cacheZomeCall.call, call) && (isEqual(cacheZomeCall.args, args))) return true     
  }
  return false
}

export const callStackCacheResponse = isInProcess => {
  return { callStackCache: { inProcess: isInProcess }}
}