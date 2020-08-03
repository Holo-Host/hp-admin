# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## unreleased
### Removed
- Header Alpha Flag
### Added
- Hosting card gets real data from HPOS for hosted happs and local source chain count

## [0.13.3] - 2020-07-31
### Added
- Github Pages deploy process
- Updated Github Pages deploy process for testfuel.holo.host
- TestFuel card on Dashboard linking to Holofuel
### Removed
- Temporarily removed Hosting and Earnings cards on Dashboard
- Removed refresh button
- Removed separate Sidemenu behaviour in Desktop. 
### Fixed
- Missing style bug causing crash after accepting a transaction
- Inbox Dont allow multiple transaction drawers to be open at once, but allow actioning a transaction while another is in process

## [0.13.1] - 2020-07-28
### Fixed
 - correct rounding
 - amount validation in inbox

## [0.13.0] - 2020-07-27
### Added
- list_pending and list_transaction endpoints now return a counterparty object with both an agentAddress and nickname
- global polling interval for all Apollo Queries accepts CLI input (integer value, measured in ms)
### Fixed
- restored mobal width for modals
- restored mobal width for sidenav
- corrected alignment for flash message
- counterparties are now cached by unique keys, created by reference to both the agentAddress and nicknames
- improves ux/user feedback for connection messages
- corrects logic for flash message reset
### Removed
 - removed HolofuelCounterparties
 - removed fetch for counterparty on Inbox page (counterparty check is now handled exlusively in DNA)

## [0.11.11] - 2020-05-26
### Added
- Inbox: DO NOT allow user to action an additional transaction while waiting for an action to complete

## [0.11.10] - 2020-05-22
### Fixed
-- Running holofuel ui outside of hp-admin ui throws an error

## [0.11.9] - 2020-05-20
### Fixed
- Missing style bug causing crash after accepting a transaction
- Inbox Dont allow multiple transaction drawers to be open at once, but allow actioning a transaction while another is in process

## [0.11.8] - 2020-05-19
### Added
- Inbox: DO allow user to action an additional transaction while waiting for an action to complete
### Fixed
- create a different deadline for each transaction to avoid duplications in the DNA

## [0.11.7] - 2020-04-30
### Fixed
- Detects hpos/conductor connection error using websocket timeouts.
### Added
- Redirects to Login on connection error and displays user message.

## [0.11.6] - 2020-04-30
### Added
- Inbox: Don't allow user to action an additional transaction while waiting for an action to complete

## [0.11.5] - 2020-04-29
### Fixed
- Show apollo logs in production