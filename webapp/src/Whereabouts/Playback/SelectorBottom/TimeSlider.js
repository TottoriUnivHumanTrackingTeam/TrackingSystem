import React, { useState, useEffect } from 'react';
import Slider from '@material-ui/core/Slider';

export default function TimeSlider(props) {
  const [timeLine, setTimeLine] = useState([]);

  useEffect(() => {
    setTimeLine(props.timeline);
  }, [props.timeline]);

  const makeTimeString = millisec => {
    const date = new Date(millisec);
    return date.toLocaleString();
  };

  return (
    <div className="TimeSlider">
      <Slider
        aria-labelledby="continuous-slider"
        max={timeLine.length - 1}
        value={props.time}
        onChange={(event, value) => props.onChange(value)}
      />
      <div className="Time">{timeLine.length ? makeTimeString(timeLine[props.time]) : ''}</div>
    </div>
  );
}
