"use strict";

const uuidV4 = require('uuid/v4');

module.exports = class Map {
  constructor(mapName, mapSize,metaName){
    this.name = mapName;
    this.size = mapSize;
    this.mName = metaName;
    this.mapID = uuidV4();
  }
};
