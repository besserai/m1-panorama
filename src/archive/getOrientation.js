


export const quarternionToAngles = (q) => {
    const phi = Math.atan2(2 * q[0] * q[1] + 2 * q[2] * q[3], 1 - 2 * q[1] * q[1] - 2 * q[2] * q[2]) * (180 / Math.PI);
    const theta = Math.asin(2 * q[0] * q[2] - 2 * q[3] * q[1]) * (180 / Math.PI);
    const psi = 90 - Math.atan2(2 * q[0] * q[3] + 2 * q[1] * q[2], 1 - 2 * q[2] * q[2] - 2 * q[3] * q[3]) * (180 / Math.PI);

    return [phi, theta, psi];
}

export function getOrientation({ window }) {
    console.log("getOrientation called")
    if ('AbsoluteOrientationSensor' in window) {
        console.log("AbsoluteOrientationSensor is supported by your device.");

        let sensor = new window.AbsoluteOrientationSensor();
        sensor.onreading = (e) => {
            let q = e.target.quaternion;
            const [heading, tilt, alt] = quarternionToAngles(q);

            // setOrientationAngles({ heading: 13, tilt: 12, alt: 11 });
            return { heading, tilt, alt }
        }
        // setOrientationAngles({ heading: 13, tilt: 12, alt: 11 });

        sensor.start();
    } else {
        console.log("AbsoluteOrientationSensor is NOT supported by your device or browser.");
    }
}
