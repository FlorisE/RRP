const assert = require('assert');
const RuntimeModule = require('../../modules/RuntimeModule');

describe('RuntimeModule', function () {
    describe('start', function() {
        it('starts CEP if a valid id is provided', function (done) {
            let module = new RuntimeModule(null, null, "test", 
                                           "test", "mock");
            let afterInit = (data) => module.stop(1);
            let cep = module.start(1, out=afterInit, closed=done);
        });
    });
});
