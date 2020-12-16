"use strict";

//Detectorからのデータなので基本的に削除, 変更はしない
require('dotenv').config();
const MongoClient = require("mongodb").MongoClient;
const FixMapLocation = require("./FixMapLocation");

const DBName = process.env.DB_NAME || "tracking";
const DBURL = process.env.DB_URL + DBName || "mongodb://localhost:27017/" + DBName;

module.exports = class FixMapLocationRepository {
  static async addFixMapLocation(putLocation) {
    const location = new FixMapLocation(
      putLocation["beaconID"],
      putLocation["grid"],
      putLocation["map"],
      putLocation["time"]
    );

    const client = await MongoClient.connect(DBURL).catch(err => {
      console.log(err);
    });
    const db = client.db(DBName);
    const res = await db.collection("fixmaplocation").insert(location);
    client.close();
    return res.result;
  }
  // FIX ME: Locationの取得条件を複合的に指定できるように関数を作り変える
  static async getLocationByTime(searchBeaconID, searchTimes) {
    const client = await MongoClient.connect(DBURL).catch(err => {
      console.log(err);
    });
    const db = client.db(DBName);
    const searchQuery = {
      $and: [
        {
          locatedTime: { $lte: searchTimes["end"], $gte: searchTimes["start"] }
        },
        { beaconID: searchBeaconID }
      ]
    };
    const locationQuery = await db
      .collection("fixmaplocation")
      .find(searchQuery)
      .toArray();
    client.close();
    let locations = [];
    for (let location of locationQuery) {
      location.alert = false;
      locations.push(location);
    }
    locations.forEach((location, idx) => {
      //閾値：19秒以下に変更
      if(locations[idx+1] && locations[idx].locatedTime - 19000 > locations[idx+1].locatedTime){
        locations[idx+1].alert = true;
      }
    });
    return locations;
  }
};
