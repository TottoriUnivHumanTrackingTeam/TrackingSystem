"use strict";

const mailer = require("nodemailer");
const TrackerRepository = require("../Tracker/TrackerRepository");

const Lost = require("./Lost");
const KeepOut = require("./KeepOut");

module.exports = class Alert {
  static async check() {
    const trackers = await TrackerRepository.getAllTracker();
    for (let tracker of trackers) {
      const lostResult = await Lost.check(tracker);
      const keepOutResult = await KeepOut.check(tracker);

      if (lostResult || keepOutResult) {
        const message =
          lostResult +
          "</br>" +
          keepOutResult +
          '</br></br><a href="http://192.168.235.135:3000">Webで確認する</a>';
        this.sendMail(tracker, message);
      } else {
        TrackerRepository.updateTracker(tracker.trackerID, tracker);
      }
    }
  }

  static sendMail(tracker, message) {
    const smtpConfig = {
      host: process.env.MAIL_HOST || "smtp.gmail.com",
      port: 465,
      secure: true, // SSL
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    };
    const date = new Date();
    if (
      this.abs(date.getTime() - tracker.mailTimeStamp) > 600000 ||
      tracker.mailTimeStamp === 0
    ) {
      const smtp = mailer.createTransport(smtpConfig);

      for (let addless of tracker.notifyAddressList) {
        let mailOptions = {
          from: process.env.MAIL_USER,
          to: addless,
          subject: "TrackingSystemAlert",
          html: message
        };

        smtp.sendMail(mailOptions, function(err, res) {
          if (err) {
            console.log(err);
          } else {
            console.log("Message sent: " + message);
            return;
          }
        });
      }
      smtp.close();
      tracker.mailTimeStamp = date.getTime();
    }
    TrackerRepository.updateTracker(tracker.trackerID, tracker);
  }

  static abs(val) {
    return val < 0 ? -val : val;
  }
};