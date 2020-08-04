"use strict";

const PositionTracking = require("./PositionTracking");
const Alert = require("../Alert/Alert");
const DetectionDataRepository = require("../DetectionData/DetectionDataRepository");
const devkit = require("../devkit");
const fs = require("fs")
let timerID;

module.exports = class PositionTrackingHandlers {
  static startPositionTracking(req, res) {
    setInterval(() => {
      const used = process.memoryUsage()
      const messages = []
      for (let key in used) {
        messages.push(`${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`)
      }
      fs.appendFile("./var/process.log", new Date() + messages.join(', ') + "\n", (err) => {
        if (err) {
          console.log(err);
        }
      });
    }, 1 * 60 * 1000)
    clearInterval(timerID);
    timerID = setInterval(() => {
      const byJson = req.body.select === "json" ? req.body : false;
      const date = new Date();
      const startTime = date.getTime() - 3000; //3秒前のデータでロケーションをアップデート
      PositionTracking.updateLocations(startTime, byJson);
      Alert.check();
    }, 1000); //一秒更新
    res.send("Tracking Start!");
  }

  static stopPositionTracking(req, res) {
    clearInterval(timerID);
    res.send("Tracking Stop!");
  }

  static updateYesterdayPositionTracking(req, res) {
    console.log("updateYesterdayPositionTracking: start")
    PositionTracking.renewLocation().then(() => {
      console.log("renewLocation: done")
      DetectionDataRepository.deleteDetectionData().then(() => {
        console.log("deleteDetectionData: done")
        res.send("RenewLocationData Success!");
      })
    })
  }
};
