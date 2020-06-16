"use strict";

const DetectionDataRepository = require("../DetectionData/DetectionDataRepository");

module.exports = class Handler {
  static addDetectionData(req, res) {
    const detectionData = req.body;
    DetectionDataRepository.addDetectionData(detectionData).then(() => {
      res.send("DetectionData Add Success!");
    });
  }
  /*
  static getDetectionData(req, res) {
    const detectionData = req.body;
    DetectionDataRepository.getDetectionData(detectionData).then(() => {
      res.send("DetectionData Get Success!");
    })
  }
  */
};
