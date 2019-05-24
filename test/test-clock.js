//  -*- coding: utf-8 -*-
//  testClock.js ---
//  created: 2014-09-27 10:12:09

'use strict';

const Lab = require('lab');
const lab = exports.lab = Lab.script();
const Code = require('code');
const expect = Code.expect;
const moment = require('moment');
const Clock = require('../index');

lab.experiment('Clock', function() {

    lab.test('Set clock to now', function(done) {
        const simClock = new Clock(moment);
        const difference = moment().diff(simClock.now(), 'seconds');

        expect(difference).to.be.below(1);
        done();
    });

    lab.test('Multiplier validation', function(done) {
        var simClock;

        simClock = new Clock(moment);
        expect(simClock.isSimulated).to.be.false();

        simClock = new Clock(moment, moment());
        expect(simClock.multiplier).to.equal(1);
        expect(simClock.isSimulated).to.be.true();
        //

        simClock = new Clock(moment, moment(), -1);
        expect(simClock.multiplier).to.equal(-1);
        expect(simClock.isSimulated).to.be.true();

        simClock = new Clock(moment, moment(), 0.5);
        expect(simClock.multiplier).to.equal(0.5);
        expect(simClock.isSimulated).to.be.true();

        expect(() => new Clock(moment, moment(), 0)).to.throw();

        simClock = new Clock(moment, moment(), 55);
        expect(simClock.multiplier).to.equal(55);
        expect(simClock.isSimulated).to.be.true();

        simClock = new Clock(moment, moment(), 10000);
        expect(simClock.multiplier).to.equal(10000);
        expect(simClock.isSimulated).to.be.true();

        done();
    });

    lab.test('Check moment in today', function(done) {
        var simClock,
            difference;

        simClock = new Clock(moment, moment().hours(16).minutes(23));
        difference = simClock.now().diff(moment().hours(16).minutes(23), 'seconds');
        expect(difference).to.be.below(1);

        done();
    });

    lab.test('Check moment on arbitrary day', function(done) {
        var simClock,
            difference;

        simClock = new Clock(moment, moment('7-4-2014 14:23', 'MM-DD-YYYY hh:mm'));
        difference = simClock.now().diff(moment('7-4-2014 14:23', 'MM-DD-YYYY hh:mm'), 'seconds');
        expect(difference).to.be.below(1);

        done();
    });

    lab.test('Pause clock moving forward', done => {
        const timesz = '2017-03-22T22:00:00Z';
        const clock = new Clock(moment, moment(timesz));
        clock.pause();

        setTimeout(() => {
            expect(clock.now().diff(moment(timesz), 'ms')).to.be.about(0, 10);
            clock.resume();
            setTimeout(() => {
                expect(clock.now().diff(moment(timesz), 'ms')).to.be.about(200, 10);
                done();
            }, 200);
        }, 200);
    });

    lab.test('Pause clock moving backward', done => {
        const timesz = '2017-03-22T22:00:00Z';
        const clock = new Clock(moment, moment(timesz), -1);
        clock.pause();

        setTimeout(() => {
            expect(clock.now().diff(moment(timesz), 'ms')).to.be.about(0, 10);
            clock.resume();
            setTimeout(() => {
                expect(clock.now().diff(moment(timesz), 'ms')).to.be.about(-200, 10);
                done();
            }, 200);
        }, 200);
    });
});

lab.experiment('Clock boost', function() {
    lab.test('x100', function(done) {
        const testStart = moment();
        const simClock = new Clock(moment, testStart, 100);

        setTimeout(function() {
            const difference = Math.abs((simClock.now().unix() - (testStart.unix() + (1.5 * 100))));
            expect(difference).to.be.below(1.1);
            done();
        }, 1500);
    });

    lab.test('x-100', function(done) {
        const testStart = moment();
        const simClock = new Clock(moment, testStart, -100);

        setTimeout(function() {
            const difference = Math.abs((simClock.now().unix() - (testStart.unix() - (1.5 * 100))));
            expect(difference).to.be.below(1.1);
            done();
        }, 1500);
    });
});
