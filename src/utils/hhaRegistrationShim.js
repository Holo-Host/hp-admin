// // import { zomeCallByInstance } from '../holochainClient'
//
// // import the rpc-websockets library
// let WebSocket = require('rpc-websockets').Client
// // instantiate Client and connect to an RPC server
// let holochainUri = 'ws://localhost:4000'
// let ws = new WebSocket(holochainUri)
//
// // create an event listener, and a callback, for when the socket connection opens
// ws.on('open', function() {
//
//
//    // call an RPC method with parameters
//    ws.call(callZome, params).then(result => {
//        console.log(result)
//    })
//
// })
//
// /**
//  * Make a zome call through the WS client, identified by instance ID
//  * TODO: maybe keep the Ok/Err wrapping, to differentiate between zome error and true exception
//  */
// export const zomeCallByInstance = async (client, callParams: CallFnParams) => {
//   const {instanceId, zomeName, funcName, args = {}} = callParams
//   const payload = {
//     instance_id: instanceId,
//     zome: zomeName,
//     function: funcName,
//     args: args || {},
//   }
//   let result
//   try {
//     result = await client.call('call', payload)
//     if (!result) {
//       throw `falsy result! (${result})`
//     }
//   } catch(e) {
//     console.error("ZOME CALL FAILED")
//     console.error(e)
//     console.error("payload:", payload)
//     console.error("result: ", result)
//     throw e
//   }
//   if (!("Ok" in result)) {
//     throw result
//   } else {
//     return result.Ok
//   }
// }
//
//
// export const SHIMS = {
//   registerAsProvider: (client) => {
//     return zomeCallByInstance(client, {
//       instanceId: C.holoHostingAppId.instance,
//       zome: 'provider',
//       function: 'register_as_provider',
//       args: {
//         provider_doc: {
//           kyc_proof: "TODO this proves nothing",
//         }
//       }
//     })
//   },
//
//   // TODO: make sure this is tested
// export const buildServiceLoggerRequestPackage = ({dnaHash, zome, function: func, args}) => {
//   return {
//     function: `${dnaHash}/${zome}/${func}`,
//     args
//   }
// }
//
//   createAndRegisterHapp: async (client, entry: HappStoreEntry) => {
//     const title = "TODO"
//     const description = "TODO"
//     const thumbnail_url = "TODO.gif"
//     const homepage_url = "TODO.com"
//
//     const happHash = await zomeCallByInstance(client, {
//       instanceId: C.happStoreId.instance,
//       zome: 'happs',
//       function: 'create_app',
//       args: {
//         title, description, thumbnail_url, homepage_url,
//         ui: entry.ui,
//         dnas: entry.dnas,
//       }
//     })
//
//     const dns_name = "TODO.whatever.xyz"
//
//     return zomeCallByInstance(client, {
//       instanceId: C.holoHostingAppId.instance,
//       zome: 'provider',
//       function: 'register_app',
//       args: {
//         app_bundle: {
//           happ_hash: happHash
//         },
//         domain_name: { dns_name },
//       }
//     })
//   }
// }
//
//
// const registerProvider = async () => {
//   await SHIMS.registerAsProvider(client)
//   client.close()
//   await delay(1000)
// }
//
// const registerApp = async (happEntry): Promise<string> => {
//   const happId = await SHIMS.createAndRegisterHapp(masterClient, happEntry)
//   console.log("registered hApp: ", happId)
//   client.close()
//   return happId
// }
