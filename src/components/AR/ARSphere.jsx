import { TextureLoader } from 'three';
import * as THREE from 'three';
import { Sphere } from '@react-three/drei';


export default function ARSphere() {

    const texture = new TextureLoader().load("blank_sky_map.jpg");
    // const texture = new TextureLoader().load("earth.jpg");

    return (
        <Sphere position={[0, 0, 0]} args={[20, 320, 320]} scale={[-1, 1, 1]} >
            <meshStandardMaterial map={texture} side={THREE.BackSide} transparent opacity={0.5} />
        </Sphere>

    );
};