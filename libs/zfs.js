'use strict';

const { spawn, spawnSync } = require('child_process');

const ExistsError = require('./Errors/exists-error.js');
const CommandError = require('./Errors/command-error.js');
const NotFoundError = require('./Errors/not-found-error.js');

class Zfs {

    constructor(pool) {

        this._checkPool(pool);
        this._pool = pool;

    }

    _checkPool(pool) {

        let result = spawnSync('zpool', [
            'list', '-o', 'name', '-H'
        ]);

        let pools = result.stdout
            .toString()
            .trim()
            .split(/\n/);

        if (pools.indexOf(pool) === -1) {

            let msg = `Pool "${pool}" not found.\n`
            msg += `Available pools: ${pools.join(', ')}`;
            throw new NotFoundError(msg);

        }

    }

    create(name) {

        let result = spawnSync('zfs', [
            'create', `${this._pool}/${name}`
        ]);

        let msg = '';

        switch (result.status) {

            case 1:
                msg = 'Dataset all ready exists.';
                throw new ExistsError(msg);
                break;

            case 2:
                msg = 'Invalid command line options were specified.';
                throw new CommandError(msg);
                break;

        }

    }

    destroy(name) {

        let result = spawnSync('zfs', [
            'destroy', `${this._pool}/${name}`
        ]);

        return result.status ? false : true;

    }

    get(name, option) {

        let result = spawnSync('zfs', [
            'get', '-o', 'value', '-H', option, `${this._pool}/${name}`
        ]);

        return result.stdout.toString().trim();

    }

    set(name, option, value) {

        let result = spawnSync('zfs', [
            'set', `${option}=${value}`, `${this._pool}/${name}`
        ]);

        return result.status ? false : true;

    }

}

module.exports = Zfs;
