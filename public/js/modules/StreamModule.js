define(
    [
        '../models/Stream',
        '../util/ObservableMap',
        '../util/ConnectionHandler',
        './Module'
    ],
    function(Stream,
             ObservableMap,
             ConnectionHandler,
             Module) {

        class StreamModule extends Module {

            constructor(d) {
                super(d);
                var self = this;
                this.streams = new ObservableMap([]);
                ConnectionHandler.register("stream", "add",
                    function (entry) {
                        return self.addStream(
                            entry.id,
                            entry.name,
                            entry.x,
                            entry.y,
                            self.programModule.get(entry.programId)
                        )
                    }
                );
                ConnectionHandler.register("stream", "remove",
                    (item) => this.streams.delete(item.id)
                );
            }

            get(id) {
                return this.streams.get(id);
            }

            getAll() {
                return this.streams.values();
            }

            addStream(id, name, x, y, program) {
                var stream = new Stream(this, id, name, x, y, program);
                return this.add(id, stream);
            }

            add(id, stream) {
                this.streams.set(id, stream);
                return stream;
            }

            update(id, stream) {
                this.streams.set(id, stream);
                ConnectionHandler.emit({
                    type: "stream",
                    action: "update",
                    id: stream.id(),
                    x: stream.x(),
                    y: stream.y(),
                    name: stream.name()
                });
            }

            delete(id) {
                ConnectionHandler.emit({
                    type: "stream", action: "remove", id: id
                });
            }

            clear() {
                this.streams.clear();
            }

            register(observer) {
                this.streams.register(observer);
            }

            get programModule() {
                return this._programModule;
            }

            set programModule(programModule) {
                this._programModule = programModule;
            }

            get program() {
                return this._program;
            }

            set program(program) {
                this._program = program;
            }

            save() {
                console.log("save in stream");
            }
        }

        return StreamModule;
    }
);
