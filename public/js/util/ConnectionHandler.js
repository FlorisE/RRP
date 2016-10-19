define(
    [
        'socket.io',
        './JSPlumbInstance'
    ],
    function (io,
              instance) {

        class ConnectionHandler {

            constructor() {
                this.id = $('#id').html();
                this.clients = new Map([]);
            }

            connect(callback, error) {
                var self = this;
                this.socket = io.connect('//localhost:3000');

                this.socket.on('connect', callback);
                this.socket.on('error', error);

                this.socket.on(this.id, function (entries) {
                    for (let entry of entries) {
                        var clientKey = `${entry.type}|${entry.action}`;
                        var client = self.clients.get(clientKey);
                        if (client) {
                            client(entry);
                        } else {
                            console.log(`No client found for ${clientKey}`);
                        }
                    }
                })
            }

            emit(msg, callback) {
                this.socket.emit(this.id, msg, callback);
            }

            register(type, action, targetFunc) {
                this.clients.set(
                    `${type}|${action}`,
                    targetFunc
                );
            }
        }

        return new ConnectionHandler();
    }
);
