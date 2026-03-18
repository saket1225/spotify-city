'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import Building from './Building';
import { BuildingParams } from '@/types';

interface CityProps {
  buildings: BuildingParams[];
  onBuildingClick: (params: BuildingParams) => void;
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#0d0d0d" />
    </mesh>
  );
}

function GridLines() {
  return <gridHelper args={[200, 50, '#1a1a1a', '#141414']} position={[0, 0.01, 0]} />;
}

export default function City({ buildings, onBuildingClick }: CityProps) {
  return (
    <Canvas
      camera={{ position: [25, 20, 25], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
      shadows
    >
      <color attach="background" args={['#080810']} />
      <fog attach="fog" args={['#080810', 30, 80]} />

      <ambientLight intensity={0.3} />
      <directionalLight
        position={[15, 20, 10]}
        intensity={0.8}
        color="#fff5e6"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[0, 15, 0]} intensity={0.3} color="#1DB954" />

      <Stars radius={100} depth={50} count={2000} factor={4} fade speed={0.5} />
      <Ground />
      <GridLines />

      {buildings.map((b, i) => (
        <Building key={b.profile.id || i} params={b} onClick={onBuildingClick} />
      ))}

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={10}
        maxDistance={60}
        maxPolarAngle={Math.PI / 2.2}
      />
    </Canvas>
  );
}
