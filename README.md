# Clock that supports simulated (and boosted) time

    npm install --save @vinka/clock

Initialize and create a service with exposed `now()` function:

```javascript

const Clock = require('@vinka/clock');

const clock = new Clock();

exports.now = () => clock.now();

```

To initialize with regular time:

    new Clock()

To initialize with simulated time:

    new Clock(new Date('2013-04-23T13:00:00'));

To initialize with simulated time and going 10x speed:

    new Clock(new Date('2013-04-23T13:00:00'), 10);

To make clock go backwards:

    new Clock(new Date(), -1);

Clock functions:

* now(): get the current simulated time as `Date` object.
* pause(): this will pause the time.
* resume(): resume after pause.
