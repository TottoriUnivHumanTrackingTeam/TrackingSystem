"use strict";

const PositionTracking = require("./PositionTracking");
const Alert = require("../Alert/Alert");
let timerID;

module.exports = class PositionTrackingHandlers {
  static startPositionTracking(req, res) {
    timerID = setInterval(() => {
      const date = new Date();
      const startTime = date.getTime() - 3000; //3秒前のデータでロケーションをアップデート
      PositionTracking.updateLocations(startTime);
      Alert.check();
    }, 1000); //一秒更新
    res.send("Tracking Start!");
  }

  static stopPositionTracking(req, res) {
    clearInterval(timerID);
    res.send("Tracking Stop!");
  }
};
