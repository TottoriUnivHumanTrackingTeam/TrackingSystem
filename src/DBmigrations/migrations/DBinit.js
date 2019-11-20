module.exports = {
  up(db) {
    // TODO write your migration here. Return a Promise (and/or use async & await).
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // return db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
    db.createCollection("location");
    db.createCollection("detector");
    db.createCollection("map");
    db.createCollection("meta");
    db.createCollection("tracker");
    db.createCollection("detectionData");
    db.createIndex("location", { locatedTime: -1 });
    db.createIndex("detectionData", { detectedTime: 1 });
    db.createIndex("detector", { detectorActiveLastTime: -1 });
  },

  down(db) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // return db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
