import React, { useState } from 'react';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';

export default function OnlyTrackerSelector(props) {
  const [items, setItems] = useState({});

  if (!items.length) {
    fetch(`${process.env.REACT_APP_API_URL}/api/tracker`)
      .then(res => res.json())
      .then(json => {
        const items = json.map(item => {
          return { name: item.trackerName, ID: item.trackerID };
        });
        setItems(items);
      });
  }

  const itemSelect = event => {
    const item = items.find(item => {
      return item.ID === event.target.value;
    });
    props.onChange(item);
  };

  const menu = [];
  if (items.length) {
    items.forEach(item => {
      menu.push(
        <div key={item.ID}>
          <Radio type="checkbox" value={item.ID} color="primary" />
          {item.name}
        </div>
      );
    });
  }
  return <RadioGroup onChange={itemSelect}>{menu}</RadioGroup>;
}
