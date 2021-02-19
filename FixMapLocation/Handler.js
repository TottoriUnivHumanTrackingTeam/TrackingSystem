"use strict";

const FixMapLocationRepository = require("../FixMapLocation/FixMapLocationRepository");

module.exports = class Handler {
  static getLocationByTimeAndMap(req, res) {
    const mapId = req.params.id;
    let searchTime = {};
    if (req.query.start && req.query.end) {
      searchTime = {
        start: Number(req.query.start),
        end: Number(req.query.end)
      };
    }
    FixMapLocationRepository.getLocationByTimeAndMap(mapId, searchTime)
      .then(locations => {
        res.send(locations);
      });
  }
};
