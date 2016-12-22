class Sender {
    constructor(id, io) {
        this.id = id;
        this.io = io;
    }

    getSendMethod(mapper, callback) {
        return (results) => {
            if (!results) {
                throw "Results is not defined";
            }
            this.io.emit(
                this.id,
                results.records.map(mapper)
            );
            if (callback) {
                callback();
            }
        }
    }

    send(value, callback) {
        this.io.emit(this.id, value);
        if (callback) {
            callback();
        }
    }
}

module.exports = Sender;