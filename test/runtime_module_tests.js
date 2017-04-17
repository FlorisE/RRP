const RuntimeModule = require('../modules/RuntimeModule');
const assert = require('assert');

describe('RuntimeModule', function() {
    let engineAdapterMock = null;
    let mud = null;

    beforeEach(function() {
        this.engineAdapterMock = {
            lastStartId: -1,
            lastStopId: -1,
            lastRestartId: -1,
            start: function(id) {
                this.lastStartId = id;
            },
            stop: function(id) {
                this.lastStopId = id;
            },
            restart: function(id) {
                this.lastRestartId = id;
            },
            running: function() {
                return [];
            }
        };

        // module under test
        this.mud = new RuntimeModule(
            null, null, "mock", "test", "mock", this.engineAdapterMock
        );
    });

    it('should call start on engine adapter', function() {
        const process = this.mud.start(1);
        assert(this.engineAdapterMock.lastStartId, 1);
    });

    it('should call stop on engine adapter', function() {
        const process = this.mud.start(1);
        this.mud.stop(1);
        assert(this.engineAdapterMock.lastStopId, 1);
    });

    it('should call restart on engine adapter', function() {
        const process = this.mud.start(1);
        process.restart(1);
        process.stop(1);
        assert(process.lastRestartId, id);
    });
});
