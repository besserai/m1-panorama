import { useState } from 'react';
import { Canvas } from '@react-three/fiber'


export default function DragCanvas({ children, setHeadingOffset, style }) {
    const [initialPointerPosition, setInitialPointerPosition] = useState(null);

    const dragFactor = 5;

    return (
        <Canvas
            style={style}
            onPointerDown={(event) => {
                // Step 2: In the onPointerDown event handler, set the initial pointer position to the current pointer position
                setInitialPointerPosition(event.clientX);
            }}
            onPointerMove={(event) => {
                // Step 3: In the onPointerMove event handler, calculate the difference between the current pointer position and the initial pointer position
                if (initialPointerPosition) {
                    const difference = event.clientX - initialPointerPosition;

                    // If the difference is above a certain threshold, update the heading offset and reset the initial pointer position
                    if (Math.abs(difference) > 50) {
                        setHeadingOffset(prevOffset => prevOffset + Math.sign(difference) * dragFactor);
                        setInitialPointerPosition(event.clientX);
                    }
                }
            }}
            onPointerUp={() => {
                // Step 4: In the onPointerUp event handler, reset the initial pointer position
                setInitialPointerPosition(null);
            }}
            onTouchStart={(event) => {
                // Set the initial touch position to the current touch position
                setInitialPointerPosition(event.touches[0].clientX);
            }}
            onTouchMove={(event) => {
                // Calculate the difference between the current touch position and the initial touch position
                if (initialPointerPosition) {
                    const difference = event.touches[0].clientX - initialPointerPosition;

                    // If the difference is above a certain threshold, update the heading offset and reset the initial touch position
                    if (Math.abs(difference) > 5) {
                        setHeadingOffset(prevOffset => prevOffset + Math.sign(difference) * dragFactor);
                        setInitialPointerPosition(event.touches[0].clientX);
                    }
                }
            }}
            onTouchEnd={() => {
                // Reset the initial touch position
                setInitialPointerPosition(null);
            }}>

            {children}
        </Canvas>
    )
}