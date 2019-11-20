'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const mongo_express = require('mongo-express/lib/middleware');
const mongo_express_config = require('./mongo_express_config');


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
app.use(express.static(path.join(__dirname, 'webapp', 'build')));
app.use(express.static(path.join(__dirname, 'webapp', 'assets')));
app.use('/mongo_express', mongo_express(mongo_express_config));

app.use('/api/tracker', TrackerRouter);
app.use('/api/detector', DetectorRouter);
app.use('/api/location', LocationRouter);
app.use('/api/detectionData', DetectionDataRouter);
app.use('/api/map', MapRouter);
app.use('/api/meta', MetaRouter);
app.use('/api/tracking', PositionTrackingRouter);

const server = app.listen((process.env.PORT || 3000), () => {
    console.log(process.env.MONGO_EXPRESS_AVAILABLE);
    console.log("Node.js is listening to PORT:" + server.address().port);
});

app.get('*', (request, response) => {
    response.sendFile(path.join(__dirname, 'webapp', 'build', 'index.html'));
});
