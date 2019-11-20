"use strict";

const MapRepository = require("./MapRepository");

module.exports = class Handler {
  static addMap(req, res) {
    const map = req.body;
    MapRepository.addMap(map).then(map => {
      res.json(map);
    });
  }

  static getMap(req, res) {
    MapRepository.getAllMap().then(map => {
      res.send(map);
    });
  }

  static deleteMap(req, res) {
    const mapId = req.params.id;
    MapRepository.removeMap(mapId).then(() => {
      res.send("Successfully delete map!");
    });
  }
};
