//  -*- coding: utf-8 -*-
//  testClock.js ---
//  created: 2014-09-27 10:12:09

'use strict';

const Lab = require('@hapi/lab');
const lab = exports.lab = Lab.script();
const Code = require('@hapi/code');
const expect = Code.expect;
const Clock = require('../index');

const diff = (d, n = new Date(), s = false) => {
    const dff = (n.getTime() - d.getTime());
    return  s ? dff / 1000 : dff;
};

lab.experiment('Clock', function() {

    lab.test('Set clock to now', function() {
        const simClock = new Clock();
        const difference = diff(simClock.now(), new Date(), true);

        expect(difference).to.be.below(1);
    });

    lab.test('now() should return Date object', function() {
        const simClock = new Clock();
        expect(simClock.now()).to.be.instanceOf(Date);
    });

    lab.test('Multiplier validation', function() {
        var simClock;

        simClock = new Clock();
        expect(simClock.isSimulated).to.be.false();

        simClock = new Clock(new Date());
        expect(simClock.multiplier).to.equal(1);
        expect(simClock.isSimulated).to.be.true();

        simClock = new Clock(new Date(), -1);
        expect(simClock.multiplier).to.equal(-1);
        expect(simClock.isSimulated).to.be.true();

        simClock = new Clock(new Date(), 0.5);
        expect(simClock.multiplier).to.equal(0.5);
        expect(simClock.isSimulated).to.be.true();

        expect(() => new Clock(new Date(), 0)).to.throw();

        simClock = new Clock(new Date(), 55);
        expect(simClock.multiplier).to.equal(55);
        expect(simClock.isSimulated).to.be.true();

        simClock = new Clock(new Date(), 10000);
        expect(simClock.multiplier).to.equal(10000);
        expect(simClock.isSimulated).to.be.true();
    });

    lab.test('Check moment in today', function() {
        const d = new Date();
        d.setHours(16);
        d.setMinutes(23);

        const simClock = new Clock(d);
        const difference = diff(d, simClock.now(), true)
        expect(difference).to.be.below(1);
    });

    lab.test('Pause clock moving forward', () => {
        const timesz = '2017-03-22T22:00:00Z';
        const clock = new Clock(new Date(timesz));
        clock.pause();

        return new Promise((res) => {
            setTimeout(() => {
                expect(diff(new Date(timesz), clock.now())).to.be.about(0, 10);
                clock.resume();
                setTimeout(() => {
                    expect(diff(new Date(timesz), clock.now())).to.be.about(200, 10);
                    res();
                }, 200);
            }, 200);
        });
    });

    lab.test('Pause clock moving backward', () => {
        const timesz = '2017-03-22T22:00:00Z';
        const clock = new Clock(new Date(timesz), -1);
        clock.pause();

        return new Promise((res) => {
            setTimeout(() => {
                expect(diff(new Date(timesz), clock.now())).to.be.about(0, 10);
                clock.resume();
                setTimeout(() => {
                    expect(diff(new Date(timesz), clock.now())).to.be.about(-200, 10);
                    res();
                }, 200);
            }, 200);
        });
    });

    lab.test('Start paused clock', () => {
        const timesz = '2017-03-22T22:00:00Z';
        const clock = new Clock(new Date(timesz), 1, true);
        expect(diff(new Date(timesz), clock.now())).to.be.equal(0);

        return new Promise(res => {
            setTimeout(() => {
                expect(diff(new Date(timesz), clock.now())).to.be.equal(0);
                res();
            }, 200);
        });
    });
});

lab.experiment('Clock boost', () => {
    lab.test('x100', function() {
        const testStart = new Date();
        const simClock = new Clock(testStart, 100);

        return new Promise(res => {
            setTimeout(function() {
                const difference = Math.abs((simClock.now().getTime() - (testStart.getTime() + (1500 * 100))));
                expect(difference).to.be.below(1100);
                res();
            }, 1500);
        });
    });

    lab.test('x-100', () => {
        const testStart = new Date();
        const simClock = new Clock(testStart, -100);

        return new Promise(res => {
            setTimeout(function() {
                const difference = Math.abs((simClock.now().getTime() - (testStart.getTime() - (1500 * 100))));
                expect(difference).to.be.below(1100);
                res();
            }, 1500);
        });
    });
});
