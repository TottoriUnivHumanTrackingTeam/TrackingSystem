"use strict";

const DetectionDataRepository = require("./DetectionDataRepository");

module.exports = class Handler {
  static addDetectionData(req, res) {
    const detectionData = req.body;
    DetectionDataRepository.addDetectionData(detectionData).then(() => {
      res.send("DetectionData Add Success!");
    });
  }
};
