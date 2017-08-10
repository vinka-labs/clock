//  -*- coding: utf-8 -*-
//  clock.js ---
//  created: 2014-09-27 10:00:02
//


'use strict';

const assert = require('assert');

/// @todo clock.diff() would be nice to get scaled diff

class Clock {
    constructor(moment, start, boost=1) {
        assert(moment && typeof moment.isMoment === 'function', `moment instance must be given as ctor param`);
        assert(boost !== 0);
        this.moment = moment;
        this._boost = boost;
        this._paused = null;
        this._pausedWallClock = 0;

        if (!start) {
            // no start time given, use current wallclock time as starting point
            this._offset = 0;
            this._simstart = moment.utc();
        } else {
            // apply offset
            this._offset = start.diff(this.moment.utc(), 'ms');
            this._simstart = this.moment.utc().add(this._offset, 'ms');
        }

        assert(this.moment.isMoment(this._simstart) && this._simstart.isValid());
    }

    get multiplier() {
        return this._boost;
    }

    get startTime() {
        return this._simstart.clone();
    }

    pause() {
        this._paused = this.now();
        this._pausedWallClock = this.moment.utc().valueOf();
    }

    resume() {
        const sleeptime = this.moment.utc().valueOf() - this._pausedWallClock;
        this._offset -= sleeptime;

        this._paused = null;
        this._pausedWallClock = 0;
    }

    now() {
        if (this._paused) {
            return this._paused.clone();
        }

        const simnow = this.moment.utc();
        simnow.add(this._offset, 'ms');

        // milliseconds since start at normal speed
        const delta = simnow.valueOf() - this._simstart.valueOf();
        // milliseconds since start at boost speed
        const boostdelta = delta * this._boost;
        // simulated time in UTC
        const simtime = this.moment(this._simstart + boostdelta).utc();

        return simtime;
    }
}

module.exports = Clock;

//
//  clock.js ends here
