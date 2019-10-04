import axios from 'axios'

export const MOCK_ENVOY_CONNECTION = true || process.env.NODE_ENV === 'test'

const axiosConfig = {
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  }
}

export function installHapp (appId) {
  if (MOCK_ENVOY_CONNECTION) {
    console.log('Envoy installing happ with id', appId)
    return Promise.resolve(true)
  } else {
    return axios.post('http://localhost:9999/holo/happs/install', { happId: appId }, axiosConfig)
  }
}

const EnvoyInterface = {
  happs: {
    install: installHapp
  }
}

export default EnvoyInterface
