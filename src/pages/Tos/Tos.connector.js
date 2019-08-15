// import React from 'react'
import { graphql, compose } from 'react-apollo'
import HpTermsOfServiceQuery from 'graphql/HpTermsOfServiceQuery.gql'

const hpTermsOfService = graphql(HpTermsOfServiceQuery, {
  props: ({ data: { hpTermsOfService } }) => ({ hpTermsOfService })
})

// const mockedData = {
//   tos: 'O Lorem Ipsum é um texto modelo da indústria tipográfica e de impressão. O Lorem Ipsum tem vindo a ser o texto padrão usado por estas indústrias desde o ano de 1500, quando uma misturou os caracteres de um texto para criar um espécime de livro. Este texto não só sobreviveu 5 séculos, mas também o salto para a tipografia electrónica, mantendo-se essencialmente inalterada. Foi popularizada nos anos 60 com a disponibilização das folhas de Letraset, que continham passagens com Lorem Ipsum, e mais recentemente com os programas de publicação como o Aldus PageMaker que incluem versões do Lorem Ipsum.'
// }
//
// const withMockedData = ComponentToBeWrapped => props =>
//   <ComponentToBeWrapped {...mockedData} {...props} />

export default compose(
  // withMockedData,
  hpTermsOfService
)
