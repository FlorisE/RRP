define([], function () {
    class Transmitter {
        constructor(id, socket) {
            this.id = id;
            this.socket = socket;
            this.socket.emit(this.id, {type: "program", action: "get-all"});
            this.programId = -1;
        }

        loadProgram(id) {
            this.send({type: "program", action: "get", id: id});
            this.programId = id;
        }

        addProgram(name) {
            this.send({type: "program", action: "add", name: name});
        }

        addStream(msg) {
            msg.programId = this.programId;
            if (msg != null) {
                this.send(msg);
            }
        }

        addOperator(msg) {
            msg.action = "add-operator";
            msg.type = "stream";
            msg.programId = this.programId;
            if (msg != null) {
                this.send(msg);
            }
        }

        removeStream(id) {
            this.send({type: "stream", action: "remove", id: id});
        }

        send(msg) {
            this.socket.emit(this.id, msg);
        }

        updateStream(msg) {
            msg.type = "stream";
            msg.action = "update";
            this.send(msg);
        }

        updateNAry(msg) {
            msg.type = "operator";
            msg.action = "update-nary";
            this.send(msg);
        }
    }

    return Transmitter;
});