// Zome Call :
const holochainZomeCall = (callZome, instance, zomeName, zomeFuncName, args) => {
  console.log('------------------------------------------------------------------')
  console.log(` ARGS for the current /${zomeFuncName.toUpperCase()}/ ZomeCall : `, args)
  console.log('------------------------------------------------------------------')
  try {
    return callZome(instance, zomeName, zomeFuncName)(args).then(r => {
      console.log(`/${zomeFuncName.toUpperCase()}/ Zome Call SUCCESS!  Entry address : `, r)
      console.log('------------------------------------------------------------------- \n')
      return r
    })
      .catch(e => {
        console.log('****************************************************************** \n')
        console.log('************* !!!!!! ZOME_CALL ERROR OCCURED !!!!!! ************** \n')
        console.log('ERROR :  ', e)
        console.log('****************************************************************** \n')
        console.log('****************************************************************** \n')

        if (e.message === 'instance identifier invalid') process.exit()
      })
  } catch (e) {
    console.log(`Error occured when connecting to HC CONDUCTOR. >>>>>>>>>>>> ERROR: (${e}) <<<<<<<<<<<<<<<<< `)
  }
}

module.exports = holochainZomeCall
