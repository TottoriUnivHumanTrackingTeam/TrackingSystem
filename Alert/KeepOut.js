'use strict';

const fs = require('fs');
const _ = require('underscore');
const MapRepository = require('../Map/MapRepository');

module.exports = class KeepOut {
  static async check(tracker) {
    const keepOutList = JSON.parse(fs.readFileSync('./keepOutMapList.json', 'utf-8'));
    const allMaps = await MapRepository.getAllMap();
    let map1 = allMaps.find((map) => map.mapID === tracker.Location.map);
    const includedMeta = (map) => {
      return map.meta === map1.mName;
    };
    const includedPlace = (map) => {
      return map.name === map1.name;
    };
    const includedMetaPlace = (map) => {
      if (map1) {
        return map.meta === map1.mName && map.name == map1.name;
      }
    };

    let keepout = false;
    for (let map of keepOutList['map']) {
      if (tracker.Location) {
        switch (true) {
          case map.hasOwnProperty('meta') && map.hasOwnProperty('name'):
            if (includedMetaPlace(map) && _.indexOf(map.IDList, tracker.trackerID) != -1) {
              tracker.alert.keepOut = true;
              keepout = true;
              return (
                tracker.trackerName + 'さんが' + map.meta + 'の' + map.name + 'に侵入しています！'
              );
            }
            break;
          case !map.hasOwnProperty('name'):
            if (includedMeta(map) && _.indexOf(map.IDList, tracker.trackerID) != -1) {
              tracker.alert.keepOut = true;
              keepout = true;
              return tracker.trackerName + 'さんが' + map.meta + 'に侵入しています！';
            }
            break;
          case !map.hasOwnProperty('meta'):
            if (includedPlace(map) && _.indexOf(map.IDList, tracker.trackerID) != -1) {
              tracker.alert.keepOut = true;
              keepout = true;
              return tracker.trackerName + 'さんが' + map.name + 'に侵入しています！';
            }
            break;
        }
        if (!keepout) {
          tracker.alert.keepOut = false;
          return '';
        }
      }
    }
  }

  static abs(val) {
    return val < 0 ? -val : val;
  }
};
