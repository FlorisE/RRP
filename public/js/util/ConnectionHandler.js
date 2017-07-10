define(
    [
        'socket.io',
        './JSPlumbInstance'
    ],
    function (io,
              instance) {

        class ConnectionHandler {

            constructor() {
                this.clients = new Map([]);
            }

            connect(callback, dependencyInjector) {
                this.dependencyInjector = dependencyInjector;
                this.socket = io.connect('//localhost:3000');

                this.socket.on('connect', callback);
                this.socket.on('id', this.welcome.bind(this));
                this.socket.on('error', this.error);
                this.socket.on('disconnect', this.disconnect);

            }

            welcome(id) {
                const self = this;
                this.id = id;
                this.dependencyInjector.programModule.loadAll();
                this.dependencyInjector.helperModule.loadAll();
                this.socket.on(this.id, function (entries) {
                    let process = (entry) => {
                        var clientKey = `${entry.type}|${entry.action}`;
                        var client = self.clients.get(clientKey);
                        if (client) {
                            client(entry);
                        } else {
                            console.log(`No client found for ${clientKey}`);
                        }
                    };

                    if (entries[Symbol.iterator]) {
                        for (let entry of entries) {
                            process(entry);
                        }
                    } else {
                        process(entries); // entries is only one item
                    }
                });
            }

            error(message) {
                console.log(message);
            }

            disconnect() {
                console.log(
                  "Server disconnected"
                );
                //setTimeout(self.connect, 5000);
            }

            emit(msg, callback) {
                console.log(
                    "Requesting " + msg.action 
                  + " from " + msg.type 
                  + " using id " + this.id
                );
                this.socket.emit(this.id, msg, callback);
            }

            register(type, action, targetFunc) {
                this.clients.set(
                    `${type}|${action}`,
                    targetFunc
                );
            }
        }

        return ConnectionHandler;
    }
);
