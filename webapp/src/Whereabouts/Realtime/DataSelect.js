import React, { useState, useEffect, useCallback } from 'react';

import { Button, FormControl, FormLabel, FormControlLabel, Radio, RadioGroup } from '@material-ui/core';

export default function DataSelector(props) {
  const [select, setSelect] = useState("");

  const startTracking = () => {
    console.log(select);
    fetch(`${process.env.REACT_APP_API_URL}/api/tracking/start`, {method: "POST", headers: {'Content-Type': 'application/json'}, body: JSON.stringify({select: select})})
        .catch((err) => {console.log(err)})
  }

  const handleChange = (event) => {
    setSelect(event.target.value);
  }
  
  return (
    <form onSubmit={startTracking}>
      <FormControl component="fieldset">
        <FormLabel component="legend">DataSelect</FormLabel>
        <RadioGroup aria-label="dataSelect" name="dataSelector" value={select} onChange={handleChange} >
          <FormControlLabel value="mongoDB" checked={select === "mongoDB"} control={<Radio />} label="データベース" />
          <FormControlLabel value="json" checked={select === "json"} control={<Radio />} label="JSONファイル" />
        </RadioGroup>
        <Button
            varian="contained"
            color="primary"
            className="StartTracking"
            type="submit"
        >
            トラッキングスタート
        </Button>
      </FormControl>
    </form>
  );
}