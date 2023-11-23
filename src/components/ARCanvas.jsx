import DragCanvas from './AR/DragCanvas';
import { DeviceOrientationControls, Sphere, PerspectiveCamera } from '@react-three/drei'
import { useRef, useEffect, useState } from 'react';
import ARSphere from './AR/ARSphere';
import ImagePlane from './AR/ImagePlane';
import SunOverlay from './AR/SunOverlay';
import { Button, Select, MenuItem, InputLabel } from '@mui/material';
import { useTheme } from '@mui/material/styles';


const radToDeg = (rad) => rad * (180 / Math.PI);

export default function ARCanvas({ children, panoramaImages, setPanoramaImages }) {
    const theme = useTheme();
    const [headingOffset, setHeadingOffset] = useState(0);
    const cameraRef = useRef();
    const controlsRef = useRef();
    const videoRef = useRef();
    const snapshotCanvasRef = useRef();
    const [snapshotResolution, setSnapshotResolution] = useState(.5);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .then(stream => {
                const video = videoRef.current;
                video.srcObject = stream;
                video.play();
            })
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        const controls = controlsRef.current;
        if (controls) {
            const offsetInRadians = headingOffset * (Math.PI / 180)
            console.log(controls)
            controls.alphaOffset = offsetInRadians;
        }

    }, [headingOffset]);

    const takeSnapshot = () => {

        const video = videoRef.current;
        const canvas = snapshotCanvasRef.current;
        const context = canvas.getContext('2d');

        const height = Math.floor(video.videoHeight * snapshotResolution);
        const width = Math.floor(video.videoWidth * snapshotResolution)

        // Set the canvas height and width to match the video feed
        canvas.width = width;
        canvas.height = height;

        // Draw the video feed onto the canvas and get the image data
        context.drawImage(video, 0, 0, width, height);
        const imageData = context.getImageData(0, 0, width, height)
        console.log("image Data height and width", imageData.height, imageData.width)

        // Get a data URL representing the image
        const imageUrl = canvas.toDataURL('image/png');

        // Save the current view direction
        const rotation = cameraRef.current.rotation.toArray().map(radToDeg);
        let azimuth = 90 - rotation[1]
        if (azimuth < 0) {
            azimuth += 360
        }
        const viewDirection = { "azimuth": azimuth, "altitude": rotation[0], "roll": rotation[2] };

        // Download the image
        if (false) {
            const imageLink = document.createElement('a');
            imageLink.href = imageUrl;
            imageLink.download = 'image.png';  // or any other filename
            imageLink.click();

            const viewDirectionJson = JSON.stringify(viewDirection);
            const viewDirectionBlob = new Blob([viewDirectionJson], { type: 'application/json' });
            const viewDirectionBlobUrl = URL.createObjectURL(viewDirectionBlob);

            const jsonLink = document.createElement('a');
            jsonLink.href = viewDirectionBlobUrl;
            jsonLink.download = 'viewDirection.json';  // or any other filename
            jsonLink.click();
        }

        // Add the image URL and view direction to the list of panorama images
        if (panoramaImages) {
            setPanoramaImages(images => [...images, { imageUrl, viewDirection, imageData }])
        } else {
            setPanoramaImages([{ imageUrl, viewDirection, imageData }])
        }

        console.log(panoramaImages)
    };


    const displayPanoramaImages = () => {

        return panoramaImages.map((image, index) => (
            <ImagePlane key={`image-${index}`} imageUrl={image.imageUrl} position={image.viewDirection} distance={6} scale={3} />
        ))
    }

    return (<>

        <div style={{ position: 'relative', width: '100%', height: '90%' }}>
            <video id="video" muted ref={videoRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}></video>
            <DragCanvas setHeadingOffset={setHeadingOffset} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                <PerspectiveCamera makeDefault position={[0, 0, 0]} ref={cameraRef} />
                <ambientLight intensity={Math.PI / 2} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
                <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
                <DeviceOrientationControls ref={controlsRef} />
                {panoramaImages && displayPanoramaImages()}
                <ARSphere />
                <SunOverlay />
            </DragCanvas>
        </div>
        <div >
            <canvas ref={snapshotCanvasRef} style={{ display: 'none' }} />
            <Button variant="contained" color="primary" onClick={takeSnapshot} >Take Snapshot</Button>
            <InputLabel id="snapshot-resolution-label">Snapshot Resolution</InputLabel>
            <Select value={snapshotResolution} onChange={(e) => {

                setSnapshotResolution(e.target.value)
            }}>
                <MenuItem value={1}>1x</MenuItem>
                <MenuItem value={0.75}>0.75x</MenuItem>
                <MenuItem value={0.5}>0.5x</MenuItem>
                <MenuItem value={0.25}>0.25x</MenuItem>
            </Select>

            {(headingOffset != 0) && `  offset: ${headingOffset}°  `}
        </div>



    </>)
}