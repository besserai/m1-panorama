import { getSunPos } from './sunPositionCalc';
import { useState, useEffect } from 'react';
import ImagePlane from './ImagePlane';

export default function SunOverlay() {

    const [sunPos, setSunPos] = useState(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            setSunPos(getSunPos({ latitude: position.coords.latitude, longitude: position.coords.longitude }))
        })

    }, [])

    return (
        sunPos && <ImagePlane imageUrl="logo_only_sun.png" position={{ altitude: sunPos.altitude, azimuth: sunPos.azimuth }} distance={5} />
    )
}