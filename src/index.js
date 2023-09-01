const { WebSocketServer } = require('ws')
const sockserver = new WebSocketServer({ port: 3000 })

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
    type: "connected",
    key:ws.key
  })

  sockserver.clients.forEach(client => {
    if (client !== ws) {
      sendData(ws, {
        type: "opponent_joined",
        id: client.key,
        states: states[client.key]
      })
      
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
          info: data.info,
          id:ws.key
        })
      })
    }
    
    if (data.type == "idle") {
      sockserver.clients.forEach(client => {
        if (client !== ws) sendData(client, {
          type: "opponent_idled",
          info: data.info,
          id: ws.key
        })
      })
    }
  })

  ws.onerror = function() {
    console.log('websocket error')
  }
})