"use strict";

const LocationRepository = require("../Location/LocationRepository");
const cron = require("node-cron");

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
    LocationRepository.getLocationByTimeAndMap(mapId, searchTime)
      .then(locations => {
        res.send(locations);
      });
  }

  static transferDocument(req, res) {
    //なぜか動かない（ボタンによるFetchも）
    cron.schedule('0 0 0 * * *', () => {
      LocationRepository.transferDocument().then(() => {
        LocationRepository.deleteAllLocation().then(() => {
          res.send("Location TransferDocument Success!")
        })
      })
    })
  }
};
