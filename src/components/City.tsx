"use client";

import { useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import Building from "./Building";
import CityCamera from "./CityCamera";
import ProfileCard from "./ProfileCard";
import { BuildingParams } from "@/types";
import { generateDemoBuildings } from "@/lib/buildingGenerator";

export default function City() {
  const [selectedBuilding, setSelectedBuilding] =
    useState<BuildingParams | null>(null);

  const buildings = useMemo(() => generateDemoBuildings(), []);

  return (
    <div className="relative w-full h-full">
      <Canvas
        shadows
        camera={{ position: [30, 25, 30], fov: 50 }}
        style={{ background: "#0A0A0A" }}
      >
        {/* Sky */}
        <Stars
          radius={100}
          depth={50}
          count={3000}
          factor={4}
          saturation={0}
          fade
          speed={0.5}
        />

        {/* Lighting */}
        <ambientLight intensity={0.15} />
        <directionalLight
          position={[20, 30, 10]}
          intensity={0.6}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          color="#b4c6ff"
        />
        <pointLight position={[0, 15, 0]} intensity={0.3} color="#1DB954" />

        {/* Ground */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.01, 0]}
          receiveShadow
        >
          <planeGeometry args={[120, 120]} />
          <meshStandardMaterial color="#0D0D0D" roughness={0.9} />
        </mesh>

        {/* Grid lines on ground */}
        <gridHelper
          args={[120, 60, "#1a1a1a", "#141414"]}
          position={[0, 0, 0]}
        />

        {/* Buildings */}
        {buildings.map((params, i) => (
          <Building
            key={`building-${i}`}
            params={params}
            onClick={setSelectedBuilding}
          />
        ))}

        {/* Camera controls */}
        <CityCamera />

        {/* Fog for depth */}
        <fog attach="fog" args={["#0A0A0A", 40, 100]} />
      </Canvas>

      {/* Profile overlay */}
      {selectedBuilding && (
        <ProfileCard
          building={selectedBuilding}
          onClose={() => setSelectedBuilding(null)}
        />
      )}
    </div>
  );
}
