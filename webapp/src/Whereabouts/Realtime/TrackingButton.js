import React from 'react';
import Button from '@material-ui/core/Button';

export default function TrackingButton(props) {
    const startTracking = () => {
        fetch(`${process.env.REACT_APP_API_URL}/api/tracking/start`).then(() => {
            console.log("tracking start");  
        })
        fetch(`${process.env.REACT_APP_API_URL}/api/detectionData`, {method: "delete"}).then(() => {
            console.log("DetectionData delete set ok")
        })
        fetch(`${process.env.REACT_APP_API_URL}/api/location/log`, {method: "put"}).then(() => {
            console.log("LocationData transfer set ok")
        })
    }  

    return (
        <Button
            varian="contained"
            color="primary"
            className="StartTracking"
            onClick={startTracking}
        >
            トラッキングスタート
        </Button>
    )
}