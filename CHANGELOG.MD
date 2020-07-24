# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## unreleased
### Added
- Github Pages deploy process
- Updated Github Pages deploy process for testfuel.holo.host
- TestFuel card on Dashboard linking to Holofuel
- Hosting card gets real data from HPOS for hosted happs and local source chain count
### Removed
- Temporarily removed Hosting and Earnings cards on Dashboard
### Fixed
- Missing style bug causing crash after accepting a transaction
- Inbox Dont allow multiple transaction drawers to be open at once, but allow actioning a transaction while another is in process
- Alpha flag positioning bug on Desktop layout

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