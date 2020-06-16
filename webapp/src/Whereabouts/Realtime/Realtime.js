import React, { useState } from 'react';
import './Realtime.scss';
import MapView from './MapView';
import TrackerSelector from '../TrackerSelector';
import TrackingButton from './TrackingButton';

export default function Realtime(props) {
  const [trackers, setTrackers] = useState([]);

  return (
    <div className="Realtime">
      <div className="Selector">
        <div className="TrackerSelector">
          <TrackerSelector onChange={setTrackers} />
        </div>
      </div>
      <div className="Map">
        <MapView chosenTrackers={trackers} />
      </div>
      <div className="TrackingButton">
        <TrackingButton />
      </div>
    </div>
  );
}
