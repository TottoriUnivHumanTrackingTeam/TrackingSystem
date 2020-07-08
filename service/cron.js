'use strict';

const cron = require('node-cron');
const PositionTrackingHandlers = require('./PositionTrackingHandlers');

const schedule = "0 0 0 * * *";

module.exports = cron.schedule(schedule, () => {
  PositionTrackingHandlers.updateYesterdayPositionTracking();
});