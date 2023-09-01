const colyseus = require("colyseus");

const gameServer = new colyseus.Server({
});
class MyRoom extends colyseus.Room {
    // When room is initialized
    onCreate (options) { }

    // Authorize client based on provided options before WebSocket handshake is complete
    onAuth (client, options, request) { }

    // When client successfully join the room
    onJoin (client, options, auth) { }

    // When a client leaves the room
    onLeave (client, consented) { }

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose () { }
}
// Server-side
gameServer.define("my_room", MyRoom, {
  map: "cs_assault"
})

// onCreate() - options are:
// {
//   name: "Jake",
//   map: "cs_assault"
// }

gameServer.listen(3000)