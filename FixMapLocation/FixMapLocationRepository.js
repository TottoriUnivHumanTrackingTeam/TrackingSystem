"use strict";

//基本的に削除, 変更はしない
require('dotenv').config();
const MongoClient = require("mongodb").MongoClient;

const DBName = process.env.DB_NAME || "tracking";
const DBURL = process.env.DB_URL + DBName || "mongodb://localhost:27017/" + DBName;

module.exports = class FixMapLocationRepository {
  static async addFixMapLocation(putLocation) {
    const client = await MongoClient.connect(DBURL).catch(err => {
      console.log(err);
    });
    const db = client.db(DBName);
    const res = await db.collection("fixmaplocation").insertMany(putLocation);
    client.close();
    return res.result;
  }
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
      locations.push(location);
    }
    return locations;
  }
};
