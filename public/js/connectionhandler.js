define(
    [
        'socket.io',
        'receiver',
        'transmitter'
    ],
    function (
        io,
        Receiver,
        Transmitter
    ) {
    class ConnectionHandler {
        constructor(instance, viewModel) {
            this.instance = instance;
            this.viewModel = viewModel;
            this.programModel = viewModel.program;
            this.id = $('#id').html();
        }

        connect() {
            this.socket = io.connect('//localhost:3000');

            this.socket.on('connect', (connection) => this.connectionEstablished(this.socket, connection, this));
            this.socket.on('error', function(error) {
                console.log(error);
            })
        }

        connectionEstablished(socket, connection, handler) {
            this.receiver = new Receiver(this.id, this.socket, this.viewModel, this.programModel);
            this.transmitter = new Transmitter(this.id, this.socket);
        }
    }

    return ConnectionHandler;
});