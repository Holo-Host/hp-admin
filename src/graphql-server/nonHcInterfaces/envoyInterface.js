import axios from 'axios'
import { MOCK_ENVOY_CONNECTION } from '../holochainClient'

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
