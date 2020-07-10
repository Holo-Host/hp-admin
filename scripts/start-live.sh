#!/bin/bash

# Default polling interval to 30000ms
POLLING_INTERVAL=${1:-30000}

rm -rf ./node_modules/.cache/babel-loader
REACT_APP_RAW_HOLOCHAIN=true REACT_APP_MOCK_DNA_CONNECTION='false' REACT_APP_POLLING_INTERVAL=$POLLING_INTERVAL node scripts/start.js
