"use client";

import { OrbitControls } from "@react-three/drei";

export default function CityCamera() {
  return (
    <OrbitControls
      makeDefault
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.5}
      minDistance={15}
      maxDistance={80}
      enablePan={true}
      panSpeed={0.8}
      rotateSpeed={0.5}
      target={[0, 3, 0]}
    />
  );
}
