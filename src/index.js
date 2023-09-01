const colyseus = require("colyseus");

const gameServer = new colyseus.Server({
    // ...
    presence: new colyseus.RedisPresence()
});
gameServer.listen(3000)