import Url from 'url-parse'
import express from 'express'
import dotenv from 'dotenv'
import expressWs from 'express-ws'
// import mockData from './mockData'

dotenv.config({ path: '../.env' })

const { port } = Url(process.env.REACT_APP_DNA_INTERFACE_URL)

const app = express()

expressWs(app)

app.ws('/', ws => {
  ws.on('message', msg => {
    // const msgParsed = JSON.parse(msg)
    const result = {
      jsonrpc: '2.0',
      result: `{
        "Ok": {
          "id": "fdkljsklj",
          "name": "H.P. Owner",
          avatarUrl: "myface.png"    
        }
      }`
    }
    console.log('sending', JSON.stringify(result))
    ws.send(JSON.stringify(result))
    ws.close()
  })
})

app.listen(port, () => console.log(`Mock Holochain conductor listening on port ${port}!`))
