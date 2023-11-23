import { useState, useEffect } from 'react'
// import { useState } from 'react'
// import { Canvas, useFrame } from '@react-three/fiber'
import ARCanvas from './components/ARCanvas';
import FovCalculator from './components/FovCalculator';
import { loadTestImages } from './components/utils/utils'
import CreatePanorama from './components/CreatePanorama';
import { Center } from '@react-three/drei';
import { Button } from '@mui/material';

const loadTestImagesOnInit = false

export default function App() {
  const [panoramaImages, setPanoramaImages] = useState(null)
  const [stitchedPanorama, setStitchedPanorama] = useState(null);
  const [segmentationMask, setSegmentationMask] = useState(null);

  const [openCVReady, setOpenCVReady] = useState(false);
  const [worker, setWorker] = useState(null);

  useEffect(() => {
    // init service worker and opencv
    const newWorker = new Worker("worker.js");
    newWorker.postMessage({ msg: 'loadOpenCV' });
    newWorker.addEventListener('message', (e) => {
      const { msg, payload } = e.data;

      if (msg === 'openCVLoaded') {
        console.log(payload)
        setOpenCVReady(true);
      }
    })

    setWorker(newWorker)

    if (loadTestImagesOnInit) {
      loadTestImagesCall()
    }
  }, [])

  const loadTestImagesCall = () => {
    loadTestImages("test_images/Alfred").then((result) => {
      console.log("result", result)
      setPanoramaImages(result.panoramaImages)
      if (result.testMask) {
        setSegmentationMask(result.testMask)
      }
    })
  }


  return (<>
    <div style={{ height: "50vh" }}>
      <ARCanvas panoramaImages={panoramaImages} setPanoramaImages={setPanoramaImages} />
    </div>
    <div style={{ justifyContent: "center", display: 'flex', flexDirection: 'column', alignItems: "center" }}>

      <div>
        <Button variant="contained" color="primary" onClick={loadTestImagesCall}>load test images</Button>
      </div>
      {openCVReady && worker && panoramaImages && <div style={{ width: "100%" }}>
        <FovCalculator panoramaImages={panoramaImages} worker={worker} />
        <CreatePanorama panoramaImages={panoramaImages} worker={worker} stitchedPanorama={stitchedPanorama} setStitchedPanorama={setStitchedPanorama} />
      </div>}

      {panoramaImages && !stitchedPanorama && <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', border: "1px solid black" }}>
        {panoramaImages.map((image, index) => {
          return <div key={`pano${index}`} style={{ width: 200, height: 200, margin: '10px' }}>
            <img key={`img${index}`} style={{ width: '100%', height: '50%', objectFit: 'fit' }} src={image.imageUrl} alt="panorama" />
            {image.viewDirection && <>
              <p key={`azi${index}`}>azimuth: {image.viewDirection.azimuth.toFixed(0)}</p>
              <p key={`alti${index}`}>altitude: {image.viewDirection.altitude.toFixed(0)}</p>
              <p key={`roll${index}`}>roll: {image.viewDirection.roll.toFixed(0)}</p>
            </>
            }
          </div>
        })}
      </div>
      }






    </div >
  </>
  )
}
