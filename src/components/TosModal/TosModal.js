import React from 'react'
import Button from 'components/Button'
import Modal from 'components/Modal'
import { string } from 'prop-types'
import './TosModal.module.css'

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

export default props => <TosModal {...mockedProps} {...props} />

export function TosModal ({
  tos,
  // history: { push },
  handleClose,
  ...props
}) {
  return <Modal
    contentLabel='Terms of Service'
    handleClose={handleClose}
    styleName='container'
    {...props}
  >
    <div styleName='header'>
      <span styleName='title'>Terms of Service</span>
    </div>

    <main styleName='content'>
      <p>{tos}</p>
    </main>

    <Button wide onClick={handleClose}>Close</Button>
  </Modal>
}

TosModal.propTypes = {
  tos: string
}
