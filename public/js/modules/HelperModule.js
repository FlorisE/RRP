define(
  [
    './Module',
    '../models/Helper',
    '../util/ObservableMap'
  ],
  function (Module,
            Helper,
            ObservableMap) {

    class HelperModule extends Module {

      constructor(d, connectionHandler) {
        super(d, connectionHandler);
        this.helpers = new ObservableMap([]);

        connectionHandler.register(
          "helper", "add",
          (entry) => this.add(
            entry.id, entry.name, entry.body
          )
        );
        connectionHandler.register(
          "helper", "update",
          (entry) => {
            var helper = this.get(entry.id);
            helper.name(entry.name);
            helper.body(entry.body);
            this.helpers.set(id, helper);
          }
        );
      }

      get(id) {
        return this.helpers.get(id);
      }

      getAll() {
        return this.helpers.values();
      }

      instantiate(id, name, body) {
        return new Helper(this, id, name, body);
      }

      create(name, body) {
        this.connectionHandler.emit(
          {
            type: 'helper',
            action: 'add',
            name: name,
            body: body
          }
        );
      }

      update(id, name, body) {
        this.connectionHandler.emit(
          {
            type: 'helper',
            action: 'update',
            id: id,
            name: name,
            body: body
          }
        );
      }

      add(id, name, body) {
        var helper = new Helper(this, id, name, body);
        this.helpers.set(id, helper);
        return helper;
      }

      delete(id) {
        return this.helpers.delete(id);
      }

      clear() {
        this.helpers.clear();
      }

      register(observer) {
        this.helpers.register(observer);
      }
    }

    return HelperModule;

  }
);
