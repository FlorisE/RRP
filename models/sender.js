function sender(id, io) {
    function send(mapper) {
        return (results) => io.emit(
            id,
            results.records.map(mapper)
        );
    }
    return send;
}

module.exports = sender;