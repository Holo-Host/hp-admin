#!/bin/bash

# Set polling var if passed in
# (polling default is set in app utils)
POLLING_INTERVAL=${1:-'0'}

# Check to verify that POLLING_INTERVAL is comprised of numbers
case $POLLING_INTERVAL in
    ''|*[!0-9]*) echo "Command Usage Error: Argument 1 must be a number" >&2; exit 1 ;;
    *)
esac

rm -rf ./node_modules/.cache/babel-loader
REACT_APP_RAW_HOLOCHAIN=true REACT_APP_MOCK_DNA_CONNECTION='false' REACT_APP_POLLING_INTERVAL=$POLLING_INTERVAL node scripts/start.js
