"use strict";

module.exports = class FixMapLocation {
  constructor(beaconID, grid, map, time, alert) {
    this.beaconID = beaconID;
    this.grid = grid;
    this.map = map;
    this.locatedTime = time;
    this.alert;
  }
};