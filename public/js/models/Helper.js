define(["lib/ace"], function () {

    class Helper {

      // Body has to be managed manually

      constructor(helperModule, id, name, parameterName, body) {
        this.helperModule = helperModule;
        this.id = ko.observable(id);
        this.name = ko.observable(name);
        this.parameterName = ko.observable(parameterName);
        this.body = ko.observable(body ? body : "");
      }

      modal() {
        const editor = ace.edit("field-body");
        editor.setValue(this.body());
        this.body.subscribe(function (newValue) {
          editor.setValue(newValue);
        });

        editor.getSession().setMode("ace/mode/python");
        return this;
      }

      remove() {
        const id = this.id();
        if (id) {
          this.helperModule.remove(id, Helper.closeModal);
        } else {
          console.log("Trying to remove a helper that has no id");
        }
      }

      static closeModal() {
        $('#add-helper').modal('hide');
      }

      save() {
        const editor = ace.edit("field-body");
        const body = editor.getValue();
        const id = this.id();

        if (id) { // update
          this.helperModule.update(id,  this.name(), this.parameterName(), body, Helper.closeModal);
        } else { // create
          this.helperModule.create(this.name(), this.parameterName(), body, Helper.closeModal);
        }
      }
    }

    return Helper
  }
);