const { WebSocketServer } = require('ws')
const sockserver = new WebSocketServer({ port: 3000 })

function randomPlayerPosition(width, height) {
  let x = Math.floor(Math.random() * width)+300;
  let y = Math.floor(Math.random() * height)+400;
  return [x, y];
}

function generateKey() {
  return (Math.floor(Math.random() * 9999) * Date.now()).toString(16)
}

function sendData(ws, data) {
  ws.send(JSON.stringify(data))
}

let states = {}
sockserver.on('connection', ws => {
  let pos = randomPlayerPosition(1000,1000)
  ws.key = generateKey()
  states[ws.key] = {
    died: false,
    x: pos[0],
    y: pos[1],
    hp: 1000,
    rotation: 0
  }

  sendData(ws, {
    type: "connected",
    key: ws.key
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
    sockserver.clients.forEach(client => {
      if (client !== ws) sendData(client, {
        type: "opponent_leaved",

        id: ws.key
      })
    })
    delete states[ws.key]
    console.log('Client has disconnected!')
  })

  ws.on('message', data => {
    data = JSON.parse(data)
    if (data.type == "move") {
      states[ws.key].x = data.info.x
      states[ws.key].y = data.info.x
      states[ws.key].rotation = data.info.rotation
      states[ws.key].hp = data.info.hp

      sockserver.clients.forEach(client => {
        if (client !== ws) sendData(client, {
          type: "opponent_moved",
          info: data.info,
          id: ws.key
        })
      })
    }

    if (data.type == "idle") {
      states[ws.key].x = data.info.x
      states[ws.key].y = data.info.x
      states[ws.key].rotation = data.info.rotation
      states[ws.key].hp = data.info.hp

      sockserver.clients.forEach(client => {
        if (client !== ws) sendData(client, {
          type: "opponent_idled",
          info: data.info,
          id: ws.key
        })
      })
    }

    if (data.type == "attack") {
      states[ws.key].x = data.info.x
      states[ws.key].y = data.info.x
      states[ws.key].rotation = data.info.rotation
      states[ws.key].hp = data.info.hp

      sockserver.clients.forEach(client => {

        if (client !== ws) sendData(client, {
          type: "opponent_attacked",
          info: data.info,
          id: ws.key
        })

      })
    }

    if (data.type == "defeated") {

      sockserver.clients.forEach(client => {
        states[data.info.id].died = true
        sendData(client, {
          type: "opponent_slained",
          info: data.info,
          attacker: ws.key
        })

      })
    }
  })

  ws.onerror = function() {
    console.log('websocket error')
  }
})