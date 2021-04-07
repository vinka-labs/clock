//  -*- coding: utf-8 -*-
//  clock.js ---
//  created: 2014-09-27 10:00:02
//


'use strict';

const assert = require('assert');

/// @todo clock.diff() would be nice to get scaled diff

class Clock {

    /**
     *
     * @param {Moment} moment - moment library.
     * @param {moment} start - simulated start time for the clock. If missing,
     *     initializes clock to current wall clock.
     * @param {number} boost - boost factor for the clock.
     */
    constructor(moment, start, boost=1, paused=false) {
        assert(moment && typeof moment.isMoment === 'function', `moment instance must be given as ctor param`);
        assert(boost !== 0);
        this.moment = moment;
        this._boost = boost;
        this._paused = null;
        this._pausedWallClock = 0;

        this._isSimulated = !!(start || boost !== 1);

        if (!start) {
            // no start time given, use current wallclock time as starting point
            this._offset = 0;
            this._simstart = moment.utc();
        } else {
            // apply offset
            this._offset = start.diff(this.moment.utc(), 'ms');
            this._simstart = this.moment.utc().add(this._offset, 'ms');
        }

        if (paused) {
            this._paused = this._simstart.clone();
            this._pausedWallClock = this.moment.utc().valueOf();
        }

        assert(this.moment.isMoment(this._simstart) && this._simstart.isValid());
    }

    /**
     * @return {Number} boost factor.
     */
    get multiplier() {
        return this._boost;
    }

    /**
     * @return {moment} the timestamp that was used to initialize this clock.
     */
    get startTime() {
        return this._simstart.clone();
    }

    /**
     * This will return `true` even if the simulated time happens to be
     * the same as wall clock time. For example:
     *
     * ```
     *     const clock = new Clock(moment, moment());
     *     console.log(clock.isSimulated);  // --> "true"
     * ```
     *
     * @return {Boolean} is the clock running a simulated time or wall clock time.
     */
    get isSimulated() {
        return this._isSimulated;
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
