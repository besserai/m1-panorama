/* global cv */

onmessage = function (e) {
    const { msg, payload } = e.data;

    if (msg === 'test') {
        console.log('test inside worker.js')
        if (cv.Mat) {
            console.log('cv.Mat is defined')
        }
        postMessage({ msg: 'done', payload: 'test' });
    } else if (msg === 'makeGrayscale') {
        const result = makeGrayscale(payload);
        console.log('after makeGrayscale');
        postMessage({ msg: 'makeGrayscaleDone', payload: result });
    } else if (msg === 'loadOpenCV') {
        loadOpenCV(payload);
    } else if (msg === 'match') {
        match(payload, msg);
    } else if (msg === 'stitchPanoramaImages') {
        stitchPanoramaImages(payload);
    } else if (msg === 'calcFovFromPanoramaImages') {
        calcFovFromPanoramaImages(payload);
    } else {
        console.log('worker received unknown message');
    }
};


async function loadOpenCV(payload = 'opencv/opencv_custom.js') {
    // eslint-disable-next-line no-restricted-globals
    self.importScripts(payload);

    let timeSpentMs = 0;
    const waitTimeMs = 10000;
    const stepTimeMs = 100;

    const intervalId = setInterval(() => {
        const limitReached = timeSpentMs > waitTimeMs;
        if (cv.Mat) {
            clearInterval(intervalId);
            let ocv_ver = cv.getBuildInformation().split(" ")[4];
            postMessage({
                msg: "openCVLoaded",
                payload: `OpenCV loaded successfully! Version: ${ocv_ver}`,
            });
        } else if (limitReached) {
            clearInterval(intervalId);
            postMessage({
                msg: "openCVFailedToLoad",
                payload: `OpenCV failed to load after ${waitTimeMs} ms`,
            });
        }
        else {
            timeSpentMs += stepTimeMs;
        }
    }, stepTimeMs);

}

async function stitchPanoramaImages(panoramaImages) {
    console.log('stitchPanoramaImages called')
    console.log('panoramaImages: ', panoramaImages)
    const startTime = performance.now();

    let stitchedPanorama = new cv.Mat();
    // fov has to be populated still
    let fieldsOfView = new cv.FloatVector();
    for (i = 0; i < panoramaImages.length; i++) {
        fieldsOfView.push_back(60);
    }

    mMultiStitchImages = new cv.MatVector();
    for (const image of panoramaImages) {
        let mat = cv.matFromImageData(image.imageData);
        mMultiStitchImages.push_back(mat);
    }

    const Stitcher = new cv.ImgStitch(mMultiStitchImages);
    console.log('Stitcher created', Stitcher)
    Stitcher.stitch(fieldsOfView, stitchedPanorama);

    stitchedPanorama = imageDataFromMat(stitchedPanorama);

    const endTime = performance.now();
    const stitchingTime = endTime - startTime;
    console.log(`stitchPanoramaImages took ${stitchingTime} ms`);

    postMessage({
        msg: "stitchPanoramaImagesDone",
        payload: { stitchedPanorama, stitchingTime }
    });

}

async function calcFovFromPanoramaImages(panoramaImages) {

    let fovs_horizontal = []
    let fovs_vertical = []

    let sideBySideImages = []

    for (let i = 0; i < panoramaImages.length - 1; i++) {
        const fixedImage = panoramaImages[i].imageData
        const movingImage = panoramaImages[i + 1].imageData

        const verticalResolution = fixedImage.height
        const horizontalResolution = fixedImage.width

        const matchResult = await match(fixedImage, movingImage, `match${i}`, true)
        const transformationMatrix = matchResult.mTransMat
        sideBySideImages.push(matchResult.sideBySideImageData)

        console.log(`verticalResolution: ${verticalResolution}, horizontalResolution: ${horizontalResolution}`)

        viewDir1 = panoramaImages[i].viewDirection
        viewDir2 = panoramaImages[i + 1].viewDirection

        const azimuthDiff = viewDir2.azimuth - viewDir1.azimuth
        const altitudeDiff = viewDir2.altitude - viewDir1.altitude
        const rollDiff = viewDir2.roll - viewDir1.roll
        console.log("rollDiff: ", rollDiff)

        const deltaX = transformationMatrix[2]
        const deltaY = transformationMatrix[5]
        const phi = Math.atan2(transformationMatrix[1], transformationMatrix[0]) * 180 / Math.PI
        console.log("phi: ", phi)

        // fov in degrees
        const fov_horizontal = horizontalResolution * azimuthDiff / deltaX;
        fovs_horizontal.push(fov_horizontal)
        const fov_vertical = verticalResolution * altitudeDiff / deltaY;
        fovs_vertical.push(fov_vertical)

        console.log(`fov_horizontal: ${fov_horizontal}, fov_vertical: ${fov_vertical}`)

    }

    const FieldOfView = {
        azimuth: fovs_horizontal.reduce((acc, val) => acc + val, 0) / fovs_horizontal.length,
        altitude: fovs_vertical.reduce((acc, val) => acc + val, 0) / fovs_vertical.length
    };

    const payload = { FieldOfView, fovs_horizontal, fovs_vertical, sideBySideImages }

    postMessage({ msg: `calcFovFromPanoramaImagesDone`, payload: payload });
    return payload
}


// async function imageDataFromUrl(url) {
//     return new Promise((resolve, reject) => {
//         const img = document.createElement('img');
//         img.crossOrigin = 'Anonymous';
//         img.onload = () => {
//             const canvas = document.createElement('canvas');
//             const ctx = canvas.getContext('2d');
//             canvas.width = img.width;
//             canvas.height = img.height;
//             ctx.drawImage(img, 0, 0);
//             resolve(ctx.getImageData(0, 0, img.width, img.height));
//         };
//         img.onerror = reject;
//         img.src = url;
//     });
// }


async function match(fixedImage, movingImage, msg, getSideBySideImage = true) {
    if (!cv.Mat) {
        console.log('opencv not ready yet');
        return
    }

    const fixedImageMat = cv.matFromImageData(fixedImage);
    const movingImageMat = cv.matFromImageData(movingImage);

    const mImgAlign = new cv.ImgAlign(fixedImageMat, movingImageMat);

    let mTransMat = new cv.Mat();
    let mFixedPtsGood = new cv.PointVector();
    let mMovingPtsGood = new cv.PointVector();
    let mFixedPtsInlier = new cv.PointVector();
    let mMovingPtsInlier = new cv.PointVector();

    const polys = [
        {
            v: new cv.PointVector(),
            src: null
        },
        {
            v: new cv.PointVector(),
            src: null
        },
    ];
    for (const poly of polys) {
        if (!poly.src) continue;
        for (let i = 0; i < poly.src.length; ++i) {
            poly.v.push_back({ x: poly.src[i].x, y: poly.src[i].y });
        }
    }

    try {
        const success = mImgAlign.match_getExtData(
            polys[0].v, polys[1].v,
            mTransMat, mFixedPtsGood, mMovingPtsGood, mFixedPtsInlier, mMovingPtsInlier);

        let payload = { mTransMat: mTransMat.data64F }

        if (getSideBySideImage) {

            let sideBySideImage = new cv.Mat();
            mImgAlign.getSideBySideImage(mFixedPtsInlier, mMovingPtsInlier, sideBySideImage)

            const dims = new cv.Size(600, 400);
            cv.resize(sideBySideImage, sideBySideImage, dims, 0, 0, 3);
            const sideBySideImageData = imageDataFromMat(sideBySideImage);

            payload.sideBySideImageData = sideBySideImageData
        }

        postMessage({ msg: `${msg}Done`, payload: payload });
        return payload
    }
    finally {
        for (const poly of polys) {
            poly.v.delete();
        }
    }
}



function makeGrayscale(image) {
    const src = cv.matFromImageData(image);
    const dst = new cv.Mat();

    // Perform image processing using OpenCV.js functions
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);

    // Create a new array with 4 channels
    const processedData = new Uint8ClampedArray(dst.cols * dst.rows * 4);

    for (let i = 0; i < dst.cols * dst.rows; i++) {
        // Set all 4 channels to the same value
        processedData[4 * i] = dst.data[i];     // Red
        processedData[4 * i + 1] = dst.data[i]; // Green
        processedData[4 * i + 2] = dst.data[i]; // Blue
        processedData[4 * i + 3] = 255;          // Alpha
    }

    // Convert the processed image back to imageData to display it
    const processedImageData = new ImageData(processedData, dst.cols, dst.rows);


    return processedImageData;
}


function imageDataFromMat(mat) {

    if (!(mat instanceof cv.Mat)) {
        throw new Error('not a valid opencv Mat instance');
    }

    if (mat.rows == 0 || mat.cols == 0) {
        return null;
    }

    // convert the mat type to cv.CV_8U
    const img = new cv.Mat();
    const depth = mat.type() % 8;
    const scale = depth <= cv.CV_8S ? 1.0 : (depth <= cv.CV_32S ? 1.0 / 256.0 : 255.0);
    const shift = (depth === cv.CV_8S || depth === cv.CV_16S) ? 128.0 : 0.0;
    mat.convertTo(img, cv.CV_8U, scale, shift);

    // convert the img type to cv.CV_8UC4
    switch (img.type()) {
        case cv.CV_8UC1:
            cv.cvtColor(img, img, cv.COLOR_GRAY2RGBA);
            break;
        case cv.CV_8UC3:
            cv.cvtColor(img, img, cv.COLOR_RGB2RGBA);
            break;
        case cv.CV_8UC4:
            break;
        default:
            throw new Error('Bad number of channels (Source image must have 1, 3 or 4 channels)');
        // return;
    }
    const clampedArray = new ImageData(new Uint8ClampedArray(img.data), img.cols, img.rows);
    img.delete();
    return clampedArray;
}