import { MOCK_HP_CONNECTION } from '../holochainClient'

const hpAdminSettings = {
  hostName: 'My Host',
  hostPubKey: 'hcsFAkeHashSTring2443223ee',
  hostEmail: 'iamahost@hosting.com',
  deviceName: 'My Very First HoloPort',
  networkId: 'my-holoport',
  sshAccess: false,
  ports: {
    deviceAdminPort: '6609',
    hcAdminPort: '8800',
    hcNetworkPort: '35353',
    hostingPort: '8080'
  }
}

const tos = 'O Lorem Ipsum é um texto modelo da indústria tipográfica e de impressão. O Lorem Ipsum tem vindo a ser o texto padrão usado por estas indústrias desde o ano de 1500, quando uma misturou os caracteres de um texto para criar um espécime de livro. Este texto não só sobreviveu 5 séculos, mas também o salto para a tipografia electrónica, mantendo-se essencialmente inalterada. Foi popularizada nos anos 60 com a disponibilização das folhas de Letraset, que continham passagens com Lorem Ipsum, e mais recentemente com os programas de publicação como o Aldus PageMaker que incluem versões do Lorem Ipsum.'

function updateHPSettings (newSettingsObject) {
  console.log('PREVIOUS hpAdminSettings: ', hpAdminSettings)
  console.log('PASSED IN newSettingsObject : ', newSettingsObject)
  const newSettings = Object.getOwnPropertyNames(newSettingsObject)
  for (const setting of newSettings) {
    console.log('setting : ', setting)
    if (hpAdminSettings[setting] !== newSettingsObject[setting]) {
      hpAdminSettings[setting] = newSettingsObject[setting]
    } else {}
  }
  console.log('NEW hpAdminSettings: ', hpAdminSettings)
  return hpAdminSettings
}

function updateSshAccess () {
  if (hpAdminSettings.sshAccess) {
    hpAdminSettings.sshAccess = false
  } else { hpAdminSettings.sshAccess = true }

  console.log('hpAdminSettings.sshAccess : ', hpAdminSettings.sshAccess)
  return hpAdminSettings.sshAccess
}

export function hpApiWrapper (fnToInvoke) {
  if (MOCK_HP_CONNECTION) {
    return fnToInvoke()
  } else {
    return console.warn('You are trying to make a live API call to the HoloPort. HP APIs are still a WIP.')
  }
}

const HoloPortInterface = {
  deviceSettings: {
    all: () => hpApiWrapper(() => hpAdminSettings),
    tos: hpApiWrapper(() => Promise.resolve(tos)),
    update: newSettingsObject => hpApiWrapper(updateHPSettings(newSettingsObject)),
    updateSSH: () => hpApiWrapper(updateSshAccess),
    factoryReset: () => hpApiWrapper(() => Promise.resolve(true))
  }
}

export default HoloPortInterface
