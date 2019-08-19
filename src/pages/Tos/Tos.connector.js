import { graphql } from '@apollo/react-hoc'
import { flow as compose } from 'lodash'
import HpTermsOfServiceQuery from 'graphql/HpTermsOfServiceQuery.gql'

const hpTermsOfService = graphql(HpTermsOfServiceQuery, {
  props: ({ data: { hpTermsOfService } }) => ({ hpTermsOfService })
})

export default compose(
  hpTermsOfService
)
