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
            entry.id, entry.name, entry.parameterName, entry.body
          )
        );
        connectionHandler.register(
          "helper", "update",
          (entry) => {
            var helper = this.get(entry.id);
            helper.name(entry.name);
            helper.parameterName(entry.parameterName);
            helper.body(entry.body);
            this.helpers.set(entry.id, helper);
          }
        );
        connectionHandler.register(
          "helper", "remove",
          (msg) => {
            this.helpers.remove(msg.id);
          }
        );
      }

      loadAll() {
        this.connectionHandler.emit(
          {
            type: "helper",
            action: "loadAll"
          }
        );
      }

      get(id) {
        return this.helpers.get(id);
      }

      getAll() {
        return this.helpers.values();
      }

      instantiate(id, name, parameterName, body) {
        return new Helper(this, id, name, parameterName, body);
      }

      create(name, parameterName, body, callback) {
        this.connectionHandler.emit(
          {
            type: 'helper',
            action: 'add',
            name: name,
            parameterName: parameterName,
            body: body
          },
          callback
        );
      }

      update(id, name, parameterName, body, callback) {
        this.connectionHandler.emit(
          {
            type: 'helper',
            action: 'update',
            id: id,
            name: name,
            parameterName: parameterName,
            body: body
          },
          callback
        );
      }

      remove(id, callback) {
        this.connectionHandler.emit(
          {
            type: 'helper',
            action: 'remove',
            id: id
          },
          callback
        );
      }

      add(id, name, parameterName, body) {
        var helper = new Helper(this, id, name, parameterName, body);
        this.helpers.set(id, helper);
        return helper;
      }

      onRemoved(id) {
        return this.helpers.remove(id);
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
