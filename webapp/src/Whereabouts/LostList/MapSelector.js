import React, { useState, useEffect } from 'react';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

export default function MapSelector(props) {
  const [mapMenu, setMapMenu] = useState([]);
  const [map, setMap] = useState({});

  if (!mapMenu.length) {
    const url = new URL(`${process.env.REACT_APP_API_URL}/api/map`);
    fetch(url)
      .then(res => res.json())
      .then(json => {
        const mapList = json.map(map => {
          return { ID: map.mapID, name: map.name, mName: map.mName };
        });
        mapList.push({ID: "1000", name: "施設外", mName: "施設"})
        mapList.push({ID: "2000", name: "うぐいすユニット*", mName: "うぐいすユニット"})
        
        const mapMenu = [];
        mapList.forEach(map => {
          const menuItem = (
            <MenuItem key={map.ID} value={map}>{`${map.mName}-${map.name}`}</MenuItem>
          );
          mapMenu.push(menuItem);
        });
        setMapMenu(mapMenu);
      });
  }

  useEffect(() => {
    props.onSend(map);
  },[props, map]);

  return (
    <Select
      className="MapSelector"
      value={map}
      onChange={(event, value) => setMap(value.props.value)}
    >
      {mapMenu}
    </Select>
  );
}
