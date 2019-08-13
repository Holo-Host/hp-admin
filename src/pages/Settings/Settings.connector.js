import React from 'react'
import { compose } from 'react-apollo'

// As an HP Owner I can review what the TOS I agreed to
// As an HP Owner I can do a factory reset
// As an HP Owner I can toggle SSH access
// As an HP Owner I can view and edit ports
// As an HP Owner I can view my registration email, public key, device name
const mockedData = {
  hostName: 'My Host',
  hostEmail: 'iamahost@hosting.com',
  networkId: 'my-holoport',
  sshAccess: false,
  tos: 'O Lorem Ipsum é um texto modelo da indústria tipográfica e de impressão. O Lorem Ipsum tem vindo a ser o texto padrão usado por estas indústrias desde o ano de 1500, quando uma misturou os caracteres de um texto para criar um espécime de livro. Este texto não só sobreviveu 5 séculos, mas também o salto para a tipografia electrónica, mantendo-se essencialmente inalterada. Foi popularizada nos anos 60 com a disponibilização das folhas de Letraset, que continham passagens com Lorem Ipsum, e mais recentemente com os programas de publicação como o Aldus PageMaker que incluem versões do Lorem Ipsum.',
  deviceAdminPort: '6669',
  hcAdminPort: '8800',
  hcNetworkPort: '35353',
  hostingPort: '8080',
  factoryReset: () => {},
  toggleSshAccess: () => {}
}

const withMockedData = ComponentToBeWrapped => props =>
  <ComponentToBeWrapped {...mockedData} {...props} />

export default compose(
  withMockedData
)
