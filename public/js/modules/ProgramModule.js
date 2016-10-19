define(
    [
        'knockout',
        '../util/ObservableMap',
        'models/Program',
        '../util/ConnectionHandler',
        './Module',
        '../util/ObservableMapToKOObservableArray'
    ],
    function(ko,
             ObservableMap,
             Program,
             ConnectionHandler,
             Module,
             mtoa) {

        class ProgramModule extends Module {

            constructor(d) {
                super(d);
                this.programs = new ObservableMap([]);
                this.observers = [];

                ConnectionHandler.register(
                    "program", "add",
                    (entry) => this.add(
                        entry.id, entry.name
                    )
                );
            }

            get(id) {
                return this.programs.get(id);
            }

            getAll() {
                return this.programs.values();
            }

            create(name, callback) {
                ConnectionHandler.emit(
                    {
                        type: 'program',
                        action: 'add',
                        name: name
                    },
                    callback
                );
            }

            instantiate(name) {
                return new Program(this.d.streamModule,
                                   this.d.operationModule,
                                   this.d.editorModule,
                                   this,
                                   null,
                                   name);
            }

            add(id, name) {
                var program = new Program(this.d.streamModule,
                                          this.d.operationModule,
                                          this.d.editorModule,
                                          this,
                                          id,
                                          name);

                mtoa(this.d.streamModule, program.streams);
                this.programs.set(id, program);
                return program;
            }

            update(id, program) {
                this.programs.set(id, program);
            }

            delete(id) {
                return this.programs.delete(id);
            }

            clear() {
                this.programs.clear();
            }

            register(observer) {
                this.programs.register(observer);
                this.observers.push(observer);
            }

            loadAll() {
                var self = this;
                ConnectionHandler.emit(
                    {
                        type: "program",
                        action: "getAll"
                    }
                );
            }

            load(id) {
                var self = this;
                this.get(id).load();
                ConnectionHandler.emit(
                    {
                        type: "program",
                        action: "get",
                        id: id
                    }
                );
            }
        }

        return ProgramModule;
    }
);
