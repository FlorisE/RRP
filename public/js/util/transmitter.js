define([], function () {
    class Transmitter {
        constructor(id, socket) {
            this.id = id;
            this.socket = socket;
            this.socket.emit(this.id, {type: "program", action: "getAll"});
            this.programId = -1;
        }

        loadProgram(id) {
            this.send({type: "program", action: "get", id: id});
            this.programId = id;
        }

        addProgram(name) {
            this.send({type: "program", action: "add", name: name});
        }

        addStream(id, name, x, y, parameters, callback) {
            this.send({
                x: x,
                y: y,
                type: "stream",
                action: "add",
                sensorId: id,
                name: name,
                programId:  this.programId,
                parameters: parameters
            }, callback);
        }

        addOperator(msg) {
            if (msg != null) {
                msg.action = "add";
                msg.type = "operator";
                this.send(msg);
            }
        }

        updateOperator(msg) {
            if (msg != null) {
                msg.action = "edit";
                msg.type = "operator";
                this.send(msg);
            }
        }

        operator(msg) {
            if (msg != null) {
                msg.type = "stream";
                this.send(msg);
            }
        }

        removeStream(id) {
            this.send({type: "stream", action: "remove", id: id});
        }

        send(msg, callback) {
            this.socket.emit(this.id, msg, callback);
        }

        updateStream(stream) {
            this.send({
                type: "stream",
                action: "update",
                id: stream.id(),
                x: stream.x(),
                y: stream.y(),
                name: stream.name()
            });
        }

        updateStreamSensor(id, name, parameters) {
            this.send({
                type: "stream",
                action: "updateStreamSensor",
                id: id,
                name: name,
                parameters: parameters
            });
        }

        updateNAry(msg) {
            msg.type = "operator";
            msg.action = "update-nary";
            this.send(msg);
        }

        addHelper(name, body) {
            this.helper("add", null, name, body);
        }

        updateHelper(id, name, body) {
            this.helper("update", id, name, body);
        }

        helper(action, id, name, body) {
            var msg = {
                type: "lambda",
                action: action,
                name: name,
                body: body
            };

            if (id != null) {
                msg.id = id;
            }

            this.send(msg);
        }
    }

    return Transmitter;
});