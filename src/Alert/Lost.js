"use strict";

module.exports = class Lost {
  static check(tracker) {
    const alertTime = 10000;
    const date = new Date();
    if (tracker.Location) {
      if (this.abs(date.getTime() - tracker.Location.locatedTime) > alertTime) {
        tracker.alert.lost = true;
        return tracker.trackerName + "さんを見失いました！";
      } else {
        tracker.alert.lost = false;
        return "";
      }
    }
  }

  static abs(val) {
    return val < 0 ? -val : val;
  }
};