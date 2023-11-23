import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function ImagePlane({ imageUrl, position = { altitude: 0, azimuth: 0 }, distance = 5, scale = 1 }) {
    const { scene } = useThree();
    const meshRef = useRef();

    useEffect(() => {
        const loader = new THREE.TextureLoader();
        loader.load(imageUrl, texture => {
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                depthTest: true,
                depthWrite: false
            });

            const geometry = new THREE.PlaneGeometry(scale, scale);
            const mesh = new THREE.Mesh(geometry, material);

            // Convert altitude and azimuth to Cartesian coordinates
            const phi = (90 - position.altitude) * (Math.PI / 180);
            const theta = (-position.azimuth) * (Math.PI / 180);
            mesh.position.set(
                -(distance * Math.sin(phi) * Math.cos(theta)),
                distance * Math.cos(phi),
                distance * Math.sin(phi) * Math.sin(theta)
            );

            // Orient the plane towards the center of the sphere
            mesh.lookAt(new THREE.Vector3(0, 0, 0));

            scene.add(mesh);
            meshRef.current = mesh;
        });

        return () => {
            if (meshRef.current) {
                scene.remove(meshRef.current);
            }
        };
    }, [imageUrl, distance, scene]);

    return null;
}

// Usage:
// <ImagePlane imageUrl="path/to/your/image.png" altitude={altitude} azimuth={azimuth} />