import React from 'react';
import Button from '@material-ui/core/Button';

export default function TrackingButton(props) {
    const startTracking = () => {
        fetch(`${process.env.REACT_APP_API_URL}/api/tracking/start`).then(() => {
            fetch(`${process.env.REACT_APP_API_URL}/api/detectionData`, {method: "delete"}).then(() => {
                fetch(`${process.env.REACT_APP_API_URL}/api/location`, {method: "delete"}).catch((err) => {
                    console.log(err)
                })
            })
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