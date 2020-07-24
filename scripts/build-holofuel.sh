#!/bin/bash

CLI_POLLING_INTERVAL=null

if [ $1 ]; then
  # Check to verify that CLI_POLLING_INTERVAL is comprised of numbers
  case $1 in
    ''|*[!0-9]*) echo "Command Usage Error: Argument 1 must be a number" >&2; exit 1 ;;
    *)
  esac
  # Set polling var if passed in
  CLI_POLLING_INTERVAL=$1
fi

rm -rf ./node_modules/.cache/babel-loader
REACT_APP_VERSION=$npm_package_version REACT_APP_HOLOFUEL_APP=true REACT_APP_RAW_HOLOCHAIN=true REACT_APP_CLI_POLLING_INTERVAL=$CLI_POLLING_INTERVAL node scripts/build.js