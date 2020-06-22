"use strict";

const DetectionDataRepository = require("../DetectionData/DetectionDataRepository");
const cron = require('node-cron');

module.exports = class Handler {
  static addDetectionData(req, res) {
    const detectionData = req.body;
    DetectionDataRepository.addDetectionData(detectionData).then(() => {
      res.send("DetectionData Add Success!");
    });
  }

  static deleteAllDetectionData(req, res) {
    cron.schedule('0 0 0 * * *', () => {
      DetectionDataRepository.deleteAllDetectionData().then(() => {
        res.send("DetectionData Delete Success!");
      })
    })
  }
};
