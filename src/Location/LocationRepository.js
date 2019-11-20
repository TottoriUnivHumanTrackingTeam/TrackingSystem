"use strict";

//Detectorからのデータなので基本的に削除, 変更はしない
require('dotenv').config();
const MongoClient = require("mongodb").MongoClient;
const Location = require("./Location");

const DBName = process.env.DB_NAME || "tracking";
const DBURL = process.env.DB_URL + DBName || "mongodb://localhost:27017/" + DBName;

module.exports = class LocationRepository {
  static async addLocation(putLocation) {
    const location = new Location(
      putLocation["beaconID"],
      putLocation["grid"],
      putLocation["map"],
      putLocation["time"]
    );

    const client = await MongoClient.connect(DBURL).catch(err => {
      console.log(err);
    });
    const db = client.db(DBName);
    const res = await db.collection("location").insert(location);
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
      .collection("location")
      .find(searchQuery)
      .toArray();
    client.close();
    let locations = [];
    for (let location of locationQuery) {
      locations.push(location);
    }
    return locations;
  }

  static async getLocationByTimeAndMap(mapID, searchTimes) {
    const client = await MongoClient.connect(DBURL).catch(err => {
      console.log(err);
    });
    const db = client.db(DBName);
    const searchQuery = {
      $and: [
        {
          locatedTime: { $lte: searchTimes["end"], $gte: searchTimes["start"] }
        },
        { map: mapID }
      ]
    };
    const locationQuery = await db
      .collection("location")
      .find(searchQuery)
      .toArray();
    client.close();
    let locations = [];
    for (let location of locationQuery) {
      locations.push(location);
    }
    return locations;
  }

  static async getLocationByBeaconIDOnly(searchBeaconID) {
    const client = await MongoClient.connect(DBURL).catch(err => {
      console.log(err);
    });
    const db = client.db(DBName);
    const searchQuery = { beaconID: searchBeaconID };
    const locationQuery = await db
      .collection("location")
      .find(searchQuery)
      .toArray();
    client.close();
    let locations = [];
    for (let location of locationQuery) {
      locations.push(location);
    }
    return locations;
  }

  static async getLocationRecently(searchBeaconID) {
    const client = await MongoClient.connect(DBURL).catch(err => {
      console.log(err);
    });
    const db = client.db(DBName);
    const searchQuery = { beaconID: searchBeaconID };
    const locationQuery = await db
      .collection("location")
      .find(searchQuery)
      .sort({ locatedTime: -1 })
      .limit(1)
      .toArray();

    client.close();
    return locationQuery[0];
  }
};
