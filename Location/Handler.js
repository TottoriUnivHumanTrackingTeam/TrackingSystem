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

  static makeLogAndDelete(req, res) {
    let result = ""
    cron.schedule('0 0 0 * * *', () => {
      cron.schedule('0 0 0 * * 1', () => {
        LocationRepository.transferDocument("updateLocation").then(() => {
          LocationRepository.deleteAllLocation("updateLocation").then(() => {
            result = "UpdataLocation And "
          })
        })
      })
      LocationRepository.transferDocument("location").then(() => {
        LocationRepository.deleteAllLocation("location").then(() => {
          result += (result ? result : "") + "Location TransferDocument Success!"
          res.end() //resultをsendしたいがエラーが出る
        })
      })
    })
  }
};
