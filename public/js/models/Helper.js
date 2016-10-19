define([], function() {

        class Helper {

            constructor(id, name, body) {
                this.id = ko.observable(id);
                this.name = ko.observable(name);
                this.body = ko.observable(body);
            }
        }

        return Helper
    }
);