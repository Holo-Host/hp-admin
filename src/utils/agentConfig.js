// Note, this is not really a config file. It's just a way for the JS to access the nix config
import { readFileSync } from 'fs'
import toml from 'toml'

const config = toml.parse(readFileSync('./conductor-config.toml', 'utf-8'))

if (config.agents.length < 1) throw new Error('No agents defined in conductor-config.toml')

export const id = config.agents[0].public_address

export const nickname = config.agents[0].name
