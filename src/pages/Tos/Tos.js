import React from 'react'
import Button from 'components/Button'
import { string } from 'prop-types'
import './Tos.module.css'

const mockedProps = {
  tos: `O Lorem Ipsum é um texto modelo da indústria tipográfica e de impressão.
        O Lorem Ipsum tem vindo a ser o texto padrão usado por estas indústrias
        desde o ano de 1500, quando uma misturou os caracteres de um texto para
        criar um espécime de livro. Este texto não só sobreviveu 5 séculos, mas
        também o salto para a tipografia electrónica, mantendo-se essencialmente
        inalterada. Foi popularizada nos anos 60 com a disponibilização das
        folhas de Letraset, que continham passagens com Lorem Ipsum, e mais
        recentemente com os programas de publicação como o Aldus PageMaker que
        incluem versões do Lorem Ipsum.`
}

export default props => <Tos {...mockedProps} {...props} />

export function Tos ({
  tos,
  history: { push }
}) {
  console.log('tos IN Tos : ', tos)
  
  const returnToSettings = () => push('/settings')
  const goToMenu = () => push('/menu')

  return <div styleName='tos-container'>
    <div styleName='header'>
      <span styleName='title'>Legal Contracts</span>
      <Button onClick={goToMenu} styleName='menu-button'>Menu</Button>
    </div>

    <main>
      <h1>Terms of Service</h1>
      <p>{tos}</p>
    </main>

    <Button onClick={returnToSettings}>Return to Settings</Button>
  </div>
}

Tos.propTypes = {
  tos: string
}
