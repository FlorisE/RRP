const spawn = require('child_process').spawn;
const cep_path = "/home/floris/dev/cep_runtime/cep.py";

// Adapter for Python implementation of CEP

class Cepy {

    constructor(engine=null, adapter=null, robot=null) {
        this.engine = engine;
        this.adapter = adapter;
        this.robot = robot;
        this.processes = new Map();
        this.status = "INIT";
    }

    start(id, init=null, out=console.log, err=console.log, closed=null) {
        if (this.processes.get(id)) {
            return `Process with id ${id} is already active`;
        }

        let params = ["-u"];

        params.push(cep_path);

        if (this.engine !== null) {
            params.push("--engine", this.engine);
        }

        if (this.adapter !== null) {
            params.push("--adapter", this.adapter);
        }

        if (this.robot !== null) {
            params.push("--robot", this.robot);
        }

        params.push(id);

        let on_close = (code) => {
            if (closed === null) {
                console.log(`CEP Runtime closed with code ${code}`);
            } else {
                closed();
            }
            this.processes.remove(id);
        };

        let on_out = (message) => {
            let strmessage = String(message);
            if (strmessage.startsWith("Ready")) {
                this.status = "READY";
                console.log(this.status);
            }
        };

        let logerror = (message) => {
            let strmessage = String(message);
            console.log(strmessage);
        };

        var cep = spawn("python", params);

        //cep.stdout.setEncoding('utf8');
        cep.stdout.on('data', on_out);
        cep.stderr.on('data', logerror);
        cep.on(
            'close', 
            on_close
        );

        this.processes.set(id, cep);

        if (init !== null) {
            init();
        }

        return cep;
    }

    info(id) {
        if (this.processes.has(id)) {
            return "running";
        } else {
            return "not running";
        }
    }

    stop(id) {
        let process = this.processes.get(id);
        if (!process) {
            return `Process with id ${id} was not found`;
        }

        process.stdin.write("Q\n");
        process.stdin.end();
    }

    restart(id) {
        this.stop(id);
        this.start(id);
    }

    // returns a list of ids of running processes
    // or, if an id is provided, whether that process is running
    running(id) {
        if (id !== undefined) {
            return this.processes.has(id);
        }

        return this.processes.keys();
    }
}

module.exports = Cepy;
