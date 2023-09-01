const { WebSocketServer } = require('ws')
const sockserver = new WebSocketServer({ port: 443 })

function generateKey() {
  return (Math.floor(Math.random() * 9999) * Date.now()).toString(16)
}

function sendData(ws, data) {
  ws.send(JSON.stringify(data))
}

let states = {}
sockserver.on('connection', ws => {
  ws.key = generateKey()
  states[ws.key] = {}

  sendData(ws, {
    type: "connected"
  })

  sockserver.clients.forEach(client => {
    if (client !== ws) {
      sendData(ws, {
        type: "opponent_joined",
        id: client.key,
        states: states[client.key]
      })
    } else {
      sendData(client, {
        type: "opponent_joined",
        id: ws.key,
        states: states[ws.key]
      })
    }
  })

  ws.on('close', () => {
    delete states[ws.key]
    console.log('Client has disconnected!')
  })

  ws.on('message', data => {
    data = JSON.parse(data)
    if (data.type == "move") {
      sockserver.clients.forEach(client => {
        if (client !== ws) sendData(client, {
          type: "opponent_moved",
          info: data.pos
        })
      })
    }
  })

  ws.onerror = function() {
    console.log('websocket error')
  }
})