"use strict";

require('dotenv').config();
const MongoClient = require("mongodb").MongoClient;
const Tracker = require("./Tracker");
const LocationRepository = require("../Location/LocationRepository");
const MapRepository = require("../Map/MapRepository");

const DBName = process.env.DB_NAME || "tracking";
const DBURL = process.env.DB_URL + DBName || "mongodb://localhost:27017/" + DBName;

module.exports = class TrackerRepository {
  static async addTracker(trackerData) {
    const tracker = new Tracker(
      trackerData["trackerName"],
      trackerData["beaconID"],
      trackerData["userStatus"]
    );

    const client = await MongoClient.connect(DBURL).catch(err => {
      console.log(err);
    });
    const db = client.db(DBName);
    const res = await db.collection("tracker").insert(tracker);
    client.close();
    return res.result;
  }

  static async removeTracker(removedBeaconID) {
    const client = await MongoClient.connect(DBURL).catch(err => {
      console.log(err);
    });
    const db = client.db(DBName);
    const removeQuery = { beaconID: removedBeaconID };
    const res = await db.collection("tracker").remove(removeQuery);
    client.close();
    return res.result;
  }

  static async getAllTracker(searchTimes = {}) {
    const client = await MongoClient.connect(DBURL).catch(err => {
      console.log(err);
    });
    const db = client.db(DBName);
    const trackerQuery = await db
      .collection("tracker")
      .find()
      .toArray();
    client.close();
    let trackers = [];
    for (let tracker of trackerQuery) {
      if (Object.keys(searchTimes).length) {
        tracker.Location = await LocationRepository.getLocationByTime(
          tracker.beaconID,
          searchTimes
        );
      } else {
        tracker.Location = await LocationRepository.getLocationRecently(
          tracker.beaconID
        );
      }
      trackers.push(tracker);
    }
    return trackers;
  }

  static async getTrackerByBeaconID(searchedBeaconID, times) {
    const client = await MongoClient.connect(DBURL).catch(err => {
      console.log(err);
    });
    const db = client.db(DBName);
    const searchQuery = { beaconID: searchedBeaconID };
    const tracker = await db.collection("tracker").findOne(searchQuery);
    if (Object.keys(times).length) {
      const locations = await LocationRepository.getLocationByTime(
        tracker.beaconID,
        times
      );
      tracker.Location = locations;
    } else {
      const locations = await LocationRepository.getLocationRecently(
        tracker.beaconID
      );
      tracker.Location = locations;
    }
    client.close();
    return tracker;
  }

  static async getTrackerByTrackerID(searchedTrackerID, times, needMapName) {
    const client = await MongoClient.connect(DBURL).catch(err => {
      console.log(err);
    });
    const db = client.db(DBName);
    const searchQuery = { trackerID: searchedTrackerID };
    const tracker = await db.collection("tracker").findOne(searchQuery);
    client.close();
    if (Object.keys(times).length) {
      const locations = await LocationRepository.getLocationByTime(
        tracker.beaconID,
        times
      );
      tracker.Location = locations;
    } else {
      const locations = await LocationRepository.getLocationRecently(
        tracker.beaconID
      );
      tracker.Location = locations;
    }
    client.close();

    if (needMapName) {
      const allMap = await MapRepository.getAllMap();
      for (let location of tracker.Location) {
        const map = allMap.find(map => {
          return map.mapID === location.map;
        });
        location.map = map.name;
      }
    }
    return tracker;
  }

  static async updateTracker(searchedTrackerID, newValueQuery) {
    const client = await MongoClient.connect(DBURL).catch(err => {
      console.log(err);
    });
    const db = client.db(DBName);
    const searchQuery = { trackerID: searchedTrackerID };
    const setValueQuery = { $set: newValueQuery };
    const res = await db
      .collection("tracker")
      .updateOne(searchQuery, setValueQuery);
    client.close();
    return res.result;
  }
};
