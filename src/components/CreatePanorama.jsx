import { useEffect, useState } from "react"
import DisplayResultImage from "./utils/DisplayResultImage";
import { Button } from '@mui/material';

const autostitch = false;

export default function CreatePanorama({ panoramaImages, worker, stitchedPanorama, setStitchedPanorama }) {
    // const [stitchedPanorama, setStitchedPanorama] = useState(null);
    const [stitchingTime, setStitchingTime] = useState(null); // in seconds
    const [autostitch, setAutostitch] = useState(false);
    const [inProgress, setInProgress] = useState(false);

    useEffect(() => {
        worker.addEventListener('message', (e) => {
            const { msg, payload } = e.data;

            if (msg === 'stitchPanoramaImagesDone') {
                console.log(msg)
                console.log(payload)
                setStitchedPanorama(payload.stitchedPanorama);
                setStitchingTime(payload.stitchingTime / 1000);
                setInProgress(false);
            }
        })
    }, [])

    useEffect(() => {
        if (autostitch) {
            if (panoramaImages.length > 0) {
                startPanoramaStitching();
            }
        }
    }
        , [panoramaImages])

    const startPanoramaStitching = () => {
        setInProgress(true);
        worker.postMessage({ msg: 'stitchPanoramaImages', payload: panoramaImages });
    }

    return (
        <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center", width: "100%" }}>
            <div>
                <Button variant="contained" color="primary" onClick={startPanoramaStitching} disabled={inProgress || (panoramaImages.length < 2)}>{inProgress ? "Stitching in progress..." : "Stitch Panorama"}</Button>
            </div>
            {inProgress && <div>
                <img src="loading.gif" />
            </div>}
            <div style={{ width: "100%", height: "auto" }}>
                {stitchingTime && <p>Stitching time: {stitchingTime.toFixed(1)} seconds</p>}
                {stitchedPanorama && <DisplayResultImage img={stitchedPanorama} canvasKey="panorama" />}
            </div>
        </div>
    )
}