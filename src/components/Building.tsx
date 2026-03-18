'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { BuildingParams, BuildingStyle } from '@/types';

interface BuildingProps {
  params: BuildingParams;
  onClick: (params: BuildingParams) => void;
}

function getStyleConfig(style: BuildingStyle) {
  switch (style) {
    case 'skyscraper':
      return { roughness: 0.1, metalness: 0.8, segments: 5, taperFactor: 0.92, crown: 'antenna' as const };
    case 'fortress':
      return { roughness: 0.8, metalness: 0.3, segments: 3, taperFactor: 1.0, crown: 'battlements' as const };
    case 'neon-tower':
      return { roughness: 0.2, metalness: 0.6, segments: 6, taperFactor: 0.95, crown: 'flat' as const };
    case 'penthouse':
      return { roughness: 0.3, metalness: 0.5, segments: 4, taperFactor: 0.88, crown: 'wide-top' as const };
    case 'brownstone':
      return { roughness: 0.9, metalness: 0.1, segments: 3, taperFactor: 1.0, crown: 'pitched' as const };
    case 'cathedral':
      return { roughness: 0.5, metalness: 0.4, segments: 4, taperFactor: 0.9, crown: 'spire' as const };
    default:
      return { roughness: 0.4, metalness: 0.5, segments: 4, taperFactor: 0.95, crown: 'flat' as const };
  }
}

export default function Building({ params, onClick }: BuildingProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { height, width, depth, primaryColor, secondaryColor, accentColor, windowGlow, style, position, profile } = params;
  const config = getStyleConfig(style);

  const glowRef = useRef(0);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.position.y = Math.sin(t * 0.4 + position[0] * 0.3) * 0.06;

    const targetScale = hovered ? 1.04 : 1;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);

    glowRef.current = 0.5 + Math.sin(t * 1.5 + position[0]) * 0.3;
  });

  const segments = useMemo(() => {
    const segs: { y: number; h: number; w: number; d: number }[] = [];
    const segCount = config.segments;
    const segHeight = height / segCount;

    // Base/lobby - wider
    segs.push({ y: segHeight * 0.5, h: segHeight, w: width * 1.15, d: depth * 1.15 });

    // Body segments with slight taper
    for (let i = 1; i < segCount; i++) {
      const scale = Math.pow(config.taperFactor, i);
      const variation = 1 + Math.sin(i * 2.1) * 0.03;
      segs.push({
        y: segHeight * (i + 0.5),
        h: segHeight - 0.04,
        w: width * scale * variation,
        d: depth * scale * variation,
      });
    }
    return segs;
  }, [height, width, depth, config]);

  const windows = useMemo(() => {
    const wins: { pos: [number, number, number]; rot: [number, number, number]; segW: number; segD: number }[] = [];

    for (const seg of segments) {
      const rows = Math.max(1, Math.floor(seg.h / 1.0));
      const colsFront = Math.max(1, Math.floor(seg.w / 0.7));
      const colsSide = Math.max(1, Math.floor(seg.d / 0.7));

      for (let r = 0; r < rows; r++) {
        const y = seg.y - seg.h / 2 + 0.4 + r * (seg.h / rows);
        for (let c = 0; c < colsFront; c++) {
          const x = -seg.w / 2 + 0.35 + c * ((seg.w - 0.4) / Math.max(1, colsFront - 1 || 1));
          wins.push({ pos: [x, y, seg.d / 2 + 0.01], rot: [0, 0, 0], segW: seg.w, segD: seg.d });
          wins.push({ pos: [x, y, -seg.d / 2 - 0.01], rot: [0, Math.PI, 0], segW: seg.w, segD: seg.d });
        }
        for (let c = 0; c < colsSide; c++) {
          const z = -seg.d / 2 + 0.35 + c * ((seg.d - 0.4) / Math.max(1, colsSide - 1 || 1));
          wins.push({ pos: [seg.w / 2 + 0.01, y, z], rot: [0, Math.PI / 2, 0], segW: seg.w, segD: seg.d });
          wins.push({ pos: [-seg.w / 2 - 0.01, y, z], rot: [0, -Math.PI / 2, 0], segW: seg.w, segD: seg.d });
        }
      }
    }
    return wins;
  }, [segments]);

  const crown = useMemo(() => {
    const topY = height;
    switch (config.crown) {
      case 'antenna':
        return (
          <group position={[0, topY, 0]}>
            <mesh position={[0, 1.5, 0]}>
              <cylinderGeometry args={[0.03, 0.06, 3, 8]} />
              <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0, 3.1, 0]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={1} />
            </mesh>
          </group>
        );
      case 'spire':
        return (
          <mesh position={[0, topY + 1.5, 0]}>
            <coneGeometry args={[width * 0.25, 3, 6]} />
            <meshPhysicalMaterial color={secondaryColor} roughness={0.3} metalness={0.7} />
          </mesh>
        );
      case 'wide-top':
        return (
          <mesh position={[0, topY + 0.25, 0]}>
            <boxGeometry args={[width * 1.3, 0.5, depth * 1.3]} />
            <meshPhysicalMaterial color={primaryColor} roughness={0.2} metalness={0.6} />
          </mesh>
        );
      case 'battlements':
        return (
          <group position={[0, topY, 0]}>
            {[-1, 1].map((xd) =>
              [-1, 1].map((zd) => (
                <mesh key={`${xd}${zd}`} position={[xd * width * 0.4, 0.4, zd * depth * 0.4]}>
                  <boxGeometry args={[0.4, 0.8, 0.4]} />
                  <meshPhysicalMaterial color={secondaryColor} roughness={0.7} metalness={0.3} />
                </mesh>
              ))
            )}
          </group>
        );
      case 'pitched':
        return (
          <mesh position={[0, topY + 0.4, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[width * 0.7, 0.8, 4]} />
            <meshPhysicalMaterial color={secondaryColor} roughness={0.8} metalness={0.1} />
          </mesh>
        );
      default: // flat
        return (
          <mesh position={[0, topY + 0.05, 0]}>
            <boxGeometry args={[width * 0.9, 0.1, depth * 0.9]} />
            <meshPhysicalMaterial color={secondaryColor} roughness={0.5} metalness={0.5} />
          </mesh>
        );
    }
  }, [height, width, depth, config.crown, primaryColor, secondaryColor, accentColor]);

  const emissiveColor = style === 'neon-tower' ? accentColor : '#ffffcc';
  const emissiveIntensity = style === 'neon-tower' ? windowGlow * 3 : windowGlow * 1.5;

  return (
    <group
      ref={groupRef}
      position={[position[0], 0, position[2]]}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      onClick={(e) => { e.stopPropagation(); onClick(params); }}
    >
      {/* Building segments */}
      {segments.map((seg, i) => (
        <mesh key={`seg-${i}`} position={[0, seg.y, 0]} castShadow>
          <boxGeometry args={[seg.w, seg.h, seg.d]} />
          <meshPhysicalMaterial
            color={i === 0 ? secondaryColor : primaryColor}
            roughness={config.roughness}
            metalness={config.metalness}
            transparent
            opacity={0.95}
          />
        </mesh>
      ))}

      {/* Edge wireframe overlay for definition */}
      {segments.map((seg, i) => (
        <mesh key={`wire-${i}`} position={[0, seg.y, 0]}>
          <boxGeometry args={[seg.w + 0.02, seg.h + 0.02, seg.d + 0.02]} />
          <meshBasicMaterial color={accentColor} wireframe transparent opacity={hovered ? 0.2 : 0.07} />
        </mesh>
      ))}

      {/* Windows with emissive glow */}
      {windows.map((w, i) => (
        <mesh key={`win-${i}`} position={w.pos} rotation={w.rot}>
          <planeGeometry args={[0.25, 0.35]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive={emissiveColor}
            emissiveIntensity={emissiveIntensity}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}

      {/* Crown */}
      {crown}

      {/* Base accent lights */}
      <pointLight position={[width * 0.6, 0.3, 0]} intensity={hovered ? 0.8 : 0.2} color={primaryColor} distance={4} />
      <pointLight position={[-width * 0.6, 0.3, 0]} intensity={hovered ? 0.8 : 0.2} color={primaryColor} distance={4} />
      <pointLight position={[0, 0.3, depth * 0.6]} intensity={hovered ? 0.8 : 0.2} color={primaryColor} distance={4} />

      {/* Neon edge glow for neon-tower style */}
      {style === 'neon-tower' && (
        <>
          <mesh position={[0, height * 0.5, 0]}>
            <boxGeometry args={[width + 0.15, height + 0.15, depth + 0.15]} />
            <meshBasicMaterial color={accentColor} wireframe transparent opacity={hovered ? 0.35 : 0.15} />
          </mesh>
        </>
      )}

      {/* Hover label */}
      {hovered && (
        <Html position={[0, height + 2, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(10,10,10,0.9)',
            backdropFilter: 'blur(10px)',
            color: '#1DB954',
            padding: '6px 14px',
            borderRadius: '8px',
            fontFamily: 'system-ui, sans-serif',
            fontSize: '13px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            border: '1px solid rgba(29,185,84,0.3)',
            boxShadow: '0 0 20px rgba(29,185,84,0.2)',
          }}>
            <span style={{ marginRight: '6px' }}>{profile.displayName}</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
              {profile.estimatedListeningHours.toLocaleString()}h
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}
