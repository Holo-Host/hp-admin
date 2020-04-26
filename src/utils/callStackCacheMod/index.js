import { isEqual, pull } from 'lodash/fp'

const cachedInProcessCallStack = []
const callStackCache = {
  inProcess: false,
  callStackCacheOpts: {
    forceCall: false,
    message: '',
    defaultResult: {}
  }
}
export const CALLSTACK_CACHE_OPTS = callStackCache.callStackCacheOpts
export const FORCE_CALL = { callStackCacheOpts: { ...CALLSTACK_CACHE_OPTS, forceCall: true } }
export const ADD_CALL = 'add'
export const REMOVE_CALL = 'remove'

export const setForceCall = () => ({ ...callStackCache, callStackCacheOpts: { ...CALLSTACK_CACHE_OPTS, forceCall: true } })
export const setCallMessage = message => ({ ...callStackCache, callStackCacheOpts: { ...CALLSTACK_CACHE_OPTS, message } })
export const setCallDefaultResult = defaultResult => ({ ...callStackCache, callStackCacheOpts: { ...CALLSTACK_CACHE_OPTS, defaultResult } })
export const setCallInProcessResult = isInProcess => ({ ...callStackCache, inProcess: isInProcess })

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
