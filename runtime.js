const net = require('net');


function connectionHandler(socket) {
    "use strict";
    socket.write("Hello");
}

const server = net.createServer(connectionHandler);

server.listen(4000, '127.0.0.1');

module.exports = { runtime: server };