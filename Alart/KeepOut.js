'use strict';

const fs = require('fs');
const _ = require('underscore');
const MapRepository = require('../Map/MapRepository');

module.exports = class KeepOut {
    static async check(tracker){
        const keepOutList = JSON.parse(fs.readFileSync('./keepOutMapList.json', 'utf-8'));

        const allMaps = await MapRepository.getAllMap();
        
        let map1 = allMaps.find(map => map.mapID === tracker.Location.map);

        const inMeta = (map) => {
            if(map.meta == map1.mname){
                return true;
            }else{
                return false;
            }
        }
        const inPlace = (map) => {
            if(map.name == map1.name){
                return true;
            }else{
                return false;
            }
        }
        const inMetaPlace = (map) => {
            if(map.meta == map1.mname && map.name == map1.name){
                return true;
            }else{
                return false;
            }
        }

        for(let map of keepOutList['map']){
            if(tracker.Location){
                if(inMetaPlace(map) && _.indexOf(map.IDList, tracker.trackerID) != -1){
                    tracker.alart.keepOut = true;
                    console.log("map to meta"); 
                    return tracker.trackerName + "さんが" + map.meta + "の" + map.name + "に侵入しています！";
                }else if(inPlace(map) && _.indexOf(map.IDList, tracker.trackerID) != -1){
                    tracker.alart.keepOut = true;
                    console.log("map"); 
                    return tracker.trackerName + "さんが" + map.name + "に侵入しています！";
                }else if(inMeta(map) && _.indexOf(map.IDList, tracker.trackerID) != -1){
                    tracker.alart.keepOut = true;
                    console.log("meta"); 
                    return tracker.trackerName + "さんが" + map.meta + "に侵入しています！";
                }else{
                    tracker.alart.keepOut = false;
                    return '';
                }
            }
        }
    }

    static abs(val) {
        return val < 0 ? -val : val;
    }
};