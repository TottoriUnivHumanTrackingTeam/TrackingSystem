"use strict";

module.exports = class Detector {
  constructor(detectorNumber, detectorGrid, detectorMap) {
    this.detectorNumber = detectorNumber;
    this.detectorGrid = detectorGrid;
    this.detectorMap = detectorMap;

    const date = new Date();
    this.detectorActiveLastTime = date.getTime();
  }
};