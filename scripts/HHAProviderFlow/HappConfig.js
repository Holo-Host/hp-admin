// NOTE: Keep in mind that the DNA and UI links *must* be real links to compressed code file in order for *envoy* to *successfully* complete happ installation and, subsequently, for the happ to be *enabled* within hha.

const HAPP_CONFIG = {
  happ1: {
    title: 'holofuel',
    description: 'hf Description',
    thumbnail_url: 'hf Image',
    homepage_url: 'hf.com',
    ui: {
      location: 'https://github.com/Holo-Host/holofuel-gui/releases/download/v0.1.0-alpha1-hc/master-ui.zip',
      hash: 'HoloFuelUIMockHash',
      handle: 'holofuel-holo-ui'
    },
    dna: [{
      location: 'https://holo-artifacts.s3-us-west-2.amazonaws.com/holofuel-v0.8.5-alpha1.dna.json',
      hash: 'QmXmouydbaQ6W4TvFheCZvBkYTmzcSD7o2yEyDuUM76AoT',
      handle: 'holofuel-holo'
    }],
    domain: {
      dns_name: 'hf-client-facing.domain.xyz'
    }
  },
  happ2: {
    title: 'hylo-evo',
    description: 'hylo-evo Description',
    thumbnail_url: 'hylo-evo Image',
    homepage_url: 'hylo-evo.com',
    ui: {
      location: '<PUT REAL HYLO EVO UI LINK HERE>',
      hash: 'HyloUIMockHash',
      handle: 'hylo-evo-holo-ui'
    },
    dna: [{
      location: '<PUT REAL HYLO EVO DNA LINK HERE>',
      hash: '<PUT REAL HYLO EVO DNA HASH HERE>',
      handle: 'hylo-evo-holo'
    }],
    domain: {
      dns_name: 'hylo-evo-client-facing.domain.xyz'
    }
  }
}

module.exports = HAPP_CONFIG
