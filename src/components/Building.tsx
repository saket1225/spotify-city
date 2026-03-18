'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { BuildingParams } from '@/types';

interface BuildingProps {
  params: BuildingParams;
  onClick: (params: BuildingParams) => void;
}

export default function Building({ params, onClick }: BuildingProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { height, width, depth, primaryColor, secondaryColor, windowGlow, position, profile } = params;

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.position.y = Math.sin(t * 0.5 + position[0] * 0.3) * 0.08;
    const target = hovered ? 1.05 : 1;
    groupRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.1);
  });

  const windows = useMemo(() => {
    const wins: { pos: [number, number, number]; face: 'front' | 'back' | 'left' | 'right' }[] = [];
    const rows = Math.max(1, Math.floor(height / 1.2));
    const colsFront = Math.max(1, Math.floor(width / 0.8));
    const colsSide = Math.max(1, Math.floor(depth / 0.8));

    for (let r = 0; r < rows; r++) {
      const y = -height / 2 + 0.8 + r * 1.2;
      for (let c = 0; c < colsFront; c++) {
        const x = -width / 2 + 0.5 + c * (width / colsFront);
        wins.push({ pos: [x, y, depth / 2 + 0.01], face: 'front' });
        wins.push({ pos: [x, y, -depth / 2 - 0.01], face: 'back' });
      }
      for (let c = 0; c < colsSide; c++) {
        const z = -depth / 2 + 0.5 + c * (depth / colsSide);
        wins.push({ pos: [width / 2 + 0.01, y, z], face: 'right' });
        wins.push({ pos: [-width / 2 - 0.01, y, z], face: 'left' });
      }
    }
    return wins;
  }, [height, width, depth]);

  const windowRotation = (face: string): [number, number, number] => {
    switch (face) {
      case 'front': return [0, 0, 0];
      case 'back': return [0, Math.PI, 0];
      case 'right': return [0, Math.PI / 2, 0];
      case 'left': return [0, -Math.PI / 2, 0];
      default: return [0, 0, 0];
    }
  };

  return (
    <group
      ref={groupRef}
      position={[position[0], height / 2, position[2]]}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      onClick={(e) => { e.stopPropagation(); onClick(params); }}
    >
      <mesh castShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={primaryColor} flatShading />
      </mesh>

      <mesh position={[0, height / 2 + 0.15, 0]} castShadow>
        <boxGeometry args={[width + 0.3, 0.3, depth + 0.3]} />
        <meshStandardMaterial color={secondaryColor} flatShading />
      </mesh>

      {windows.map((w, i) => (
        <mesh key={i} position={w.pos} rotation={windowRotation(w.face)}>
          <planeGeometry args={[0.35, 0.5]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffaa"
            emissiveIntensity={windowGlow * 1.5}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}

      {hovered && (
        <Html position={[0, height / 2 + 1.2, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(0,0,0,0.85)',
            color: '#1DB954',
            padding: '4px 10px',
            borderRadius: '4px',
            fontFamily: '"Silkscreen", monospace',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            border: '1px solid #1DB954',
          }}>
            {profile.displayName}
          </div>
        </Html>
      )}
    </group>
  );
}
