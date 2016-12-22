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

        addOperation(msg, callback) {
            if (msg != null) {
                msg.action = "add";
                msg.type = "operation";
                this.send(msg, callback);
            }
        }

        updateOperation(msg, callback) {
            if (msg != null) {
                msg.action = "edit";
                msg.type = "operation";
                this.send(msg, callback);
            }
        }

        operation(msg) {
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

        updateStreamSensor(id, name, parameters, callback) {
            this.send(
                {
                    type: "sensorStream",
                    action: "update",
                    id: id,
                    name: name,
                    programId:  this.programId,
                    parameters: parameters
                },
                callback
            );
        }

        updateNAry(msg) {
            msg.type = "operation";
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