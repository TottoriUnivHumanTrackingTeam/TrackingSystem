'use strict';

const PositionTracking = require('./PositionTracking');
const Alert = require('../Alert/Alert');
let timerID;

module.exports = class PositionTrackingHandlers {
  static startPositionTracking(req, res) {
    timerID = setInterval(() => {
      const date = new Date();
      const startTime = date.getTime() - 6000;
      PositionTracking.updateLocations(startTime);
      Alert.check();
    }, 1000);
    res.send('Tracking Start!');
  }

  static stopPositionTracking(req, res) {
    clearInterval(timerID);
    res.send('Tracking Stop!');
  }
};
