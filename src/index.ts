'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const mongoExpress = require('mongo-express/lib/middleware');
const mongoExpressConfig = require('./mongo_express_config');

const PositionTrackingRouter = require('./service/PositionTrackingRouter');
const DetectionDataRouter = require('./DetectionData/Router');
const DetectorRouter = require('./Detector/Router');
const LocationRouter = require('./Location/Router');
const MapRouter = require('./Map/Router');
const MetaRouter = require('./Meta/Router');
const TrackerRouter = require('./Tracker/Router');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(process.env.NODE_PATH, 'webapp', 'build')));
app.use(express.static(path.join(process.env.NODE_PATH, 'webapp', 'assets')));
app.use('/mongo_express', mongoExpress(mongoExpressConfig));

app.use('/api/tracker', TrackerRouter);
app.use('/api/detector', DetectorRouter);
app.use('/api/location', LocationRouter);
app.use('/api/detectionData', DetectionDataRouter);
app.use('/api/map', MapRouter);
app.use('/api/meta', MetaRouter);
app.use('/api/tracking', PositionTrackingRouter);

const server = app.listen(process.env.PORT || 3000, () => {
  console.log('Node.js is listening to PORT:' + server.address().port);
});

app.get('*', (request, response) => {
  response.sendFile(path.join(process.env.NODE_PATH, 'webapp', 'build', 'index.html'));
});
