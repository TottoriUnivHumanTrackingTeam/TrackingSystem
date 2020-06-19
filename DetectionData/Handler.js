"use strict";

const DetectionDataRepository = require("../DetectionData/DetectionDataRepository");

module.exports = class Handler {
  static addDetectionData(req, res) {
    const detectionData = req.body;
    DetectionDataRepository.addDetectionData(detectionData).then(() => {
      res.send("DetectionData Add Success!");
    });
  }

  static deleteAllDetectionData(req, res) {
    DetectionDataRepository.deleteAllDetectionData().then(() => {
      res.send("DetectionData Delete Success!");
    })
  }
};
