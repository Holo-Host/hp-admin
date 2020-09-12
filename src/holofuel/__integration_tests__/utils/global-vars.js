export const DNA_INSTANCE = process.env.REACT_APP_TEST_DNA_INSTANCE_ID
export const MOCK_EXPIRATION_DATE = '2025-01-02T03:04:05.678901234+00:00'

// note: These are test-hpos server instances running on a droplet
export const TEST_HOSTS = [
    {
        host_id: '2zwc1vwrjav2199fwmrmirbyyhlj6hyxmkn1m0rojz98c259gq', // test host #1 pubkey
        host_email: 'joel+hpos1@holo.host', // test host #1 email
        host_password: 'asdfasdf' // test host #1 pwd
    },{
        host_id: 'tp26u5v8qlo8ztbwhr5n4rjcpfvxezne4thpdxsnxx736de18', // test host #2 pubkey
        host_email: 'joel+hpos1@holo.host', // test host #2 email
        host_password: 'asdfasdf' // test host #2 pwd
    },{
        host_id: '4h9v7kmbjqm75f0uh5v0i49jdatcgpnb9wy94oclzvh6l8jt7c', // test host # pubkey
        host_email: 'joel+hpos1@holo.host', // test host # email
        host_password: 'asdfasdf' // test host # pwd
    }
]

export const HOSTED_AGENT = {
    email: 'bobbo@holo.host',
    password: '123454321testest'
}

export const SCREENSHOT_PATH = './src/holofuel/__integration_tests__/holo/snapshots'
export const TIMEOUT = 300000;
