import { graphql } from '@apollo/react-hoc'
import { flow as compose } from 'lodash'
import HostPricingQuery from 'graphql/HostPricingQuery.gql'
import UpdateHostPricingMutation from 'graphql/UpdateHostPricingMutation.gql'

const hostPricing = graphql(HostPricingQuery, {
  props: ({ data: { hostPricing } }) => ({ hostPricing })
})

const updateHostPricing = graphql(UpdateHostPricingMutation, {
  props: ({ mutate }) => ({
    updateHostPricing: ({ units, pricePerUnit }) => mutate({
      variables: {
        units,
        pricePerUnit
      }
    })
  })
})

export default compose(
  hostPricing,
  updateHostPricing
)
