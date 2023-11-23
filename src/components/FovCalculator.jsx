import React, { useState, useEffect, useRef } from 'react';
import DisplayResultImage from './utils/DisplayResultImage';
import { Button } from '@mui/material';

// const defaultFoV = { altitude: 1.989889975415455, azimuth: 4.795426611931362 }

export default function FovCalculator({ panoramaImages, worker }) {
    const [fieldOfView, setFieldOfView] = useState(null);
    const [pl, setPl] = useState(null);

    worker.addEventListener('message', (e) => {
        const { msg, payload } = e.data;

        // if (msg === `matchDone`) {
        //     setTransMatrix(payload.mTransMat);
        //     if (payload.sideBySideImageData !== undefined) {
        //         displayResultImage(payload.sideBySideImageData);
        //     }
        // }

        // if (msg === 'makeGrayscaleDone') {
        //     displayResultImage(payload);
        // }
        if (msg === 'calcFovFromPanoramaImagesDone') {
            console.log(payload)
            setFieldOfView(payload.FieldOfView);
            setPl(payload);
        }

    });

    const handleCalculateFieldOfViewButton = () => {
        worker.postMessage({ msg: 'calcFovFromPanoramaImages', payload: panoramaImages });
    }

    // function DisplayResultImage(imageData) {
    //     const canvasRef = useRef(null);
    //     const ctx = canvasRef.current.getContext('2d');
    //     ctx.putImageData(imageData, 0, 0);
    //     return <canvas ref={canvasRef} width={imageData.width} height={imageData.height} />
    // }


    return (
        <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center", width: "100%" }}>
            <Button variant="outlined" color="primary" onClick={handleCalculateFieldOfViewButton}>Calculate Field of View</Button>
            {fieldOfView && <div>
                <p>Field of View:</p>
                <p>
                    {fieldOfView.azimuth.toFixed(2)} horizontal deg
                </p>
                <p>
                    {fieldOfView.altitude.toFixed(2)} vertical deg
                </p>
            </div>}
            {pl && <div>
                <p>Payload:</p>
                {pl.fovs_horizontal.map((fov, i) => {
                    return <p key={`hori-${i}`}>horizontal: {fov.toFixed(2)} deg</p>
                })
                }
                {pl.fovs_vertical.map((fov, i) => {
                    return <p key={`verti-${i}`}>vertical: {fov.toFixed(2)} deg</p>
                })
                }

                {pl.sideBySideImages.map((img, i) => <DisplayResultImage canvasKey={i} img={img} />)}


            </div>}
        </div>
    )
}