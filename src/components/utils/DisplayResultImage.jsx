import React, { useRef, useEffect } from 'react';

export default function DisplayResultImage({ img, canvasKey }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (canvasRef.current) {
            if (img === null) {
                return <div>no image</div>
            }
            const ctx = canvasRef.current.getContext('2d');
            ctx.putImageData(img, 0, 0);
        }
    }, [img]);

    return <div style={{ width: "80%", height: "auto" }}>

        <canvas ref={canvasRef} key={`result-canvas-${canvasKey}`} style={{ width: '100%', height: 'auto', border: "1px solid black" }} width={img.width} height={img.height} />
    </div >

}