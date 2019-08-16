
import { graphql, compose } from 'react-apollo'
import HostPricingQuery from 'graphql/HostPricingQuery.gql'
import UpdateHostPricingMutation from 'graphql/UpdateHostPricingMutation.gql'

const hostPricing = graphql(HostPricingQuery, {
  props: ({ data: { hostPricing } }) => ({ hostPricing })
})

const updateHostPricing = graphql(UpdateHostPricingMutation, {
  props: ({ mutate }) => ({
    updateHostPricing: ({ units, fuelPerUnit }) => mutate({
      variables: {
        units,
        fuelPerUnit
      }
    })
  })
})

export default compose(
  hostPricing,
  updateHostPricing
)
