"use strict";

const uuidV4 = require("uuid/v4");
const Identicon = require("../../node_modules/identicon.js/identicon");

module.exports = class Tracker {
  constructor(trackerName, beaconID, userStatus = "Tenant") {
    //Main User Status
    this.trackerName = trackerName;
    this.trackerID = uuidV4();
    this.beaconID = beaconID;
    this.userStatus = userStatus;
    this.userImage = new Identicon(
      this.trackerID.replace(/-/g, ""),
      32
    ).toString();

    //Alert Status
    this.alert = { lost: false, keepOut: false };
    this.keepOutMaps = [];
    this.notifyAddressList = [];
    this.mailTimeStamp = 0;
  }
};
