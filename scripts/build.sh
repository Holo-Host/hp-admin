#!/bin/bash

# Default polling interval to 30000ms
POLLING_INTERVAL=${1:-'30000'}

# Check to verify that POLLING_INTERVAL is comprised of numbers
case $POLLING_INTERVAL in
    ''|*[!0-9]*) echo "Command Usage Error: Argument 1 must be a number" >&2; exit 1 ;;
    *)
esac

rm -rf ./node_modules/.cache/babel-loader

REACT_APP_VERSION=$npm_package_version REACT_APP_POLLING_INTERVAL=$POLLING_INTERVAL node scripts/build.js