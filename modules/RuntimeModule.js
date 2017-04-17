const Cepy = require('../util/runtime/cepy');

class RuntimeModule {
    constructor(dao, sender, engine=null, dbadapter=null, robot=null, engineAdapter=null) {
        this.dao = dao;
        this.sender = sender;
        this.engine = engine;
        this.dbadapter = dbadapter;
        this.robot = robot;

        if (engineAdapter !== null) {
            this.engineAdapter = engineAdapter;
        } else {
            this.engineAdapter = new Cepy(engine, dbadapter, robot);
        }
    }

    start(id, init=null, out=console.log, err=console.log, closed=null) {
        if (this.running(id)) {
            this.stop(id);
        }
        this.engineAdapter.start(id, init, out, err, closed);
        return true;
    }

    info(id) {
        return this.engineAdapter.info(id);
    }

    stop(id) {
        return this.engineAdapter.stop(id);
    }

    restart(id) {
        return this.engineAdapter.restart(id);
    }

    running(id) {
        return this.engineAdapter.running(id);
    }
}

module.exports = RuntimeModule;
