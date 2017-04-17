const assert = require('assert');
const Cepy = require('../util/runtime/cepy');

describe('cepy', function() {
    it('starts and closes', function() {
        let cep = new Cepy("mock", "test", "mock");
        cep.start(1);
        cep.stop(1);
    });
});
