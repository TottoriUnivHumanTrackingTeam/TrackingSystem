"use strict";

module.exports = class FixMapLocation {
  constructor(beaconID, grid, map, time) {
    this.beaconID = beaconID;
    this.grid = grid;
    this.map = map;
    this.locatedTime = time;
  }
};