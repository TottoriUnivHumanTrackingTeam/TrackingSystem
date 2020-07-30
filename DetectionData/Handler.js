"use strict";

const DetectionDataRepository = require("../DetectionData/DetectionDataRepository");
const PositionTrackingHandlers = require("../service/PositionTrackingHandlers");

let counter = 0;

module.exports = class Handler {
  static addDetectionData(req, res) {
    const detectionData = req.body;
    DetectionDataRepository.addDetectionData(detectionData).then(() => {
      res.send("DetectionData Add Success!");
    });
  }

  static uploadData2Server(req, res) {
    DetectionDataRepository.uploadData2Server(req.file).then(() => {
      counter++;
      res.send("Upload Success!");
      if (counter == 5) {
        PositionTrackingHandlers.updateYesterdayPositionTracking();
        counter = 0;
      }
    })
  }
};
