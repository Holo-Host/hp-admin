// NOTE: Keep in mind that the DNA and UI links *must* be real links to compressed code file in order for *envoy* to *successfully* complete happ installation and, subsequently, for the happ to be *enabled* within hha.

const happConfig = {
  happ1: {
    title: 'HoloFuel',
    description: 'Manage and redeem payments for hosting',
    thumbnail_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2cMFvYqaw7TtcTkPFcwE8pupKWqLFMCFu2opap9jqUoqIcAKB',
    homepage_url: 'about-holofuel.com',
    ui: {
      location: 'https://github.com/Holo-Host/holofuel-gui/releases/download/v0.1.0-alpha1-hc/master-ui.zip',
      hash: 'HoloFuelUIMockHash',
      handle: 'holofuel-holo-ui'
    },
    dna: [{
      location: 'https://holo-artifacts.s3-us-west-2.amazonaws.com/holofuel-v0.8.5-alpha1.dna.json',
      hash: 'QmcqAKFLP6WrjWghWVzrgnoa72EWu211C7Fu2F1FwRMU1k',
      handle: 'holofuel-holo'
    }],
    domain: {
      dns_name: 'hf-client-facing.domain.xyz'
    }
  },
  happ2: {
    title: 'Holo Community',
    description: 'Connect with other hosts in the Holo network',
    thumbnail_url: 'https://d3ngex8q79bk55.cloudfront.net/misc/default_community_avatar.png',
    homepage_url: 'about-holo-community.com',
    ui: {
      location: 'https://github.com/holochain/hylo-holo-dnas/archive/0.0.16-test.zip',
      hash: 'HyloUIMockHash',
      handle: 'holo-community-holo-ui'
    },
    dna: [{
      location: 'https://github.com/holochain/hylo-holo-dnas/archive/0.0.16-test.zip',
      hash: 'QmQHb3XZeV4YMnCrajrngo9mbgaVqndoGY1cuuqhh1aeTq',
      handle: 'holo-community-holo'
    }],
    domain: {
      dns_name: 'holo-community-client-facing.domain.xyz'
    }
  }
}

module.exports = happConfig
