'use strict';

const cron = require('node-cron');
const Handler = require('../Location/Handler');

const daySchedule = "0 */1 * * * *";
const weekSchedule = "0 0 0 * * 1";

module.exports.day = cron.schedule(daySchedule, () => {
  Handler.logMakeAndDelete("location");
});

module.exports.week = cron.schedule(weekSchedule, () => {
  Handler.logMakeAndDelete("updatelocation");
});