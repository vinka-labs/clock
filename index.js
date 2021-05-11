//  -*- coding: utf-8 -*-
//  clock.js ---
//  created: 2014-09-27 10:00:02
//


'use strict';

const assert = require('assert');

/// @todo clock.diff() would be nice to get scaled diff

/**
 * Moment polyfill used only internally.
 */
class Moment {
    constructor(sz) {
        this._time = sz ? new Date(sz) : new Date();
    }

    static utc(timestamp) {
        return new Moment(timestamp);
    }

    diff(date) {
        const me = this._time.getTime();
        const you = date.getTime();
        return me - you;
    }

    add(ms) {
        const me = this._time.getTime();
        this._time = new Date(me + ms);
        return new Moment(this._time);
    }

    clone() {
        return new Moment(this._time);
    }

    getTime() {
        return this._time.getTime();
    }

    now() {
        return new Date(this._time);
    }
}

class Clock {

    /**
     *
     * @param {Moment} moment - moment library.
     * @param {moment} start - simulated start time for the clock. If missing,
     *     initializes clock to current wall clock.
     * @param {number} boost - boost factor for the clock.
     */
    constructor(start, boost=1, paused=false) {
        assert(boost !== 0);
        this._boost = boost;
        this._paused = null;
        this._pausedWallClock = 0;

        this._isSimulated = !!(start || boost !== 1);

        if (!start) {
            // no start time given, use current wallclock time as starting point
            this._offset = 0;
            this._simstart = Moment.utc();
        } else {
            // apply offset
            start = Moment.utc(start);
            this._offset = start.diff(Moment.utc());
            this._simstart = Moment.utc().add(this._offset);
        }

        if (paused) {
            this._paused = this._simstart.clone();
            this._pausedWallClock = Moment.utc().getTime();
        }
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
        this._paused = new Moment(this.now());
        this._pausedWallClock = Moment.utc().getTime();
    }

    resume() {
        const sleeptime = Moment.utc().getTime() - this._pausedWallClock;
        this._offset -= sleeptime;

        this._paused = null;
        this._pausedWallClock = 0;
    }

    now() {
        if (this._paused) {
            return this._paused.now();
        }

        const simnow = Moment.utc();
        simnow.add(this._offset);

        // milliseconds since start at normal speed
        const delta = simnow.getTime() - this._simstart.getTime();
        // milliseconds since start at boost speed
        const boostdelta = delta * this._boost;
        // simulated time in UTC
        const simtime = new Date(this._simstart.getTime() + boostdelta);

        return simtime;
    }
}

module.exports = Clock;

//
//  clock.js ends here
