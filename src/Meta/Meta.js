'use strict';

module.exports = class Meta {
  constructor(metaName, metaSize){
    this.name = metaName;
    this.size = metaSize;
    this.mapIDList = [];
  }
};