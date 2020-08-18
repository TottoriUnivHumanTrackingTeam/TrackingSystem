'use strict';

const cron = require('node-cron');
const Handler = require('../Location/Handler');

const daySchedule = "0 0 0 * * *";
const weekSchedule = "0 0 0 * * 1";

module.exports.day = cron.schedule(daySchedule, () => {
  console.log("cron schedule: day location")
  Handler.logMakeAndDelete("location");
});

module.exports.week = cron.schedule(weekSchedule, () => {
  console.log("cron schedule: week location")
  Handler.logMakeAndDelete("updateLocation");
});