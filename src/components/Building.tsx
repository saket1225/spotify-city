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

type CrownType = 'antenna' | 'spire' | 'flat' | 'battlements' | 'pitched' | 'wide-top' | 'dome' | 'helipad' | 'stepped';
type FootprintType = 'box' | 'cylinder' | 'l-shape' | 't-shape' | 'tapered' | 'cluster';

function getStyleConfig(style: BuildingStyle) {
  switch (style) {
    case 'skyscraper':
      return { roughness: 0.1, metalness: 0.8, segments: 5, taperFactor: 0.92, crown: 'antenna' as CrownType, footprint: 'tapered' as FootprintType };
    case 'fortress':
      return { roughness: 0.4, metalness: 0.5, segments: 3, taperFactor: 1.0, crown: 'battlements' as CrownType, footprint: 'l-shape' as FootprintType };
    case 'neon-tower':
      return { roughness: 0.2, metalness: 0.6, segments: 6, taperFactor: 0.95, crown: 'helipad' as CrownType, footprint: 'cylinder' as FootprintType };
    case 'penthouse':
      return { roughness: 0.3, metalness: 0.5, segments: 4, taperFactor: 0.88, crown: 'dome' as CrownType, footprint: 'box' as FootprintType };
    case 'brownstone':
      return { roughness: 0.35, metalness: 0.5, segments: 3, taperFactor: 1.0, crown: 'pitched' as CrownType, footprint: 'cluster' as FootprintType };
    case 'cathedral':
      return { roughness: 0.5, metalness: 0.4, segments: 4, taperFactor: 0.9, crown: 'spire' as CrownType, footprint: 't-shape' as FootprintType };
    default:
      return { roughness: 0.4, metalness: 0.5, segments: 4, taperFactor: 0.95, crown: 'stepped' as CrownType, footprint: 'box' as FootprintType };
  }
}

// Deterministic hash from position for consistent randomness
function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export default function Building({ params, onClick }: BuildingProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { height, width, depth, primaryColor, secondaryColor, accentColor, windowGlow, style, position, profile, isCurrentUser } = params;
  const config = getStyleConfig(style);

  const glowRef = useRef(0);
  const seed = position[0] * 73 + position[2] * 137;
  const buildingVariant = seededRandom(seed);

  // Blinking windows state
  const windowBlinkRef = useRef<Float32Array | null>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.position.y = Math.sin(t * 0.4 + position[0] * 0.3) * 0.06;

    const targetScale = hovered ? 1.04 : 1;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);

    glowRef.current = 0.5 + Math.sin(t * 1.5 + position[0]) * 0.3;
  });

  // Generate footprint geometry pieces
  const footprintPieces = useMemo(() => {
    const pieces: { x: number; z: number; w: number; d: number; isMain: boolean }[] = [];

    switch (config.footprint) {
      case 'l-shape': {
        // Main block
        pieces.push({ x: 0, z: 0, w: width, d: depth, isMain: true });
        // L extension
        pieces.push({ x: width * 0.35, z: depth * 0.35, w: width * 0.55, d: depth * 0.55, isMain: false });
        break;
      }
      case 't-shape': {
        // Main tall block
        pieces.push({ x: 0, z: 0, w: width * 0.6, d: depth, isMain: true });
        // Cross bar (shorter)
        pieces.push({ x: 0, z: 0, w: width * 1.3, d: depth * 0.45, isMain: false });
        break;
      }
      case 'cluster': {
        // Main building
        pieces.push({ x: 0, z: 0, w: width * 0.7, d: depth * 0.7, isMain: true });
        // Smaller attached buildings
        pieces.push({ x: width * 0.4, z: depth * 0.15, w: width * 0.45, d: depth * 0.5, isMain: false });
        pieces.push({ x: -width * 0.2, z: -depth * 0.35, w: width * 0.4, d: depth * 0.4, isMain: false });
        break;
      }
      default: {
        pieces.push({ x: 0, z: 0, w: width, d: depth, isMain: true });
        break;
      }
    }
    return pieces;
  }, [width, depth, config.footprint]);

  const segments = useMemo(() => {
    const allSegs: { y: number; h: number; w: number; d: number; x: number; z: number; isCylinder: boolean }[] = [];

    for (const piece of footprintPieces) {
      const pieceHeight = piece.isMain ? height : height * (0.4 + buildingVariant * 0.35);
      const segCount = piece.isMain ? config.segments : Math.max(2, config.segments - 2);
      const segHeight = pieceHeight / segCount;
      const isCylinder = config.footprint === 'cylinder' && piece.isMain;

      // Base/lobby - wider
      allSegs.push({
        y: segHeight * 0.5,
        h: segHeight,
        w: piece.w * 1.15,
        d: piece.d * 1.15,
        x: piece.x,
        z: piece.z,
        isCylinder,
      });

      // Body segments with taper
      for (let i = 1; i < segCount; i++) {
        let scale = Math.pow(config.taperFactor, i);
        // Extra taper for tapered footprint
        if (config.footprint === 'tapered' && piece.isMain) {
          scale *= Math.pow(0.96, i);
        }
        const variation = 1 + Math.sin(i * 2.1) * 0.03;
        allSegs.push({
          y: segHeight * (i + 0.5),
          h: segHeight - 0.04,
          w: piece.w * scale * variation,
          d: piece.d * scale * variation,
          x: piece.x,
          z: piece.z,
          isCylinder,
        });
      }
    }
    return allSegs;
  }, [height, width, depth, config, footprintPieces, buildingVariant]);

  const windows = useMemo(() => {
    const wins: { pos: [number, number, number]; rot: [number, number, number]; blinkId: number }[] = [];
    let blinkId = 0;

    for (const seg of segments) {
      if (seg.isCylinder) {
        // Cylindrical windows around circumference
        const radius = seg.w / 2;
        const rows = Math.max(1, Math.floor(seg.h / 1.0));
        const cols = Math.max(4, Math.floor(radius * Math.PI * 2 / 0.7));
        for (let r = 0; r < rows; r++) {
          const y = seg.y - seg.h / 2 + 0.4 + r * (seg.h / rows);
          for (let c = 0; c < cols; c++) {
            const angle = (c / cols) * Math.PI * 2;
            const wx = seg.x + Math.cos(angle) * (radius + 0.01);
            const wz = seg.z + Math.sin(angle) * (radius + 0.01);
            wins.push({ pos: [wx, y, wz], rot: [0, -angle + Math.PI / 2, 0], blinkId: blinkId++ });
          }
        }
        continue;
      }

      const rows = Math.max(1, Math.floor(seg.h / 1.0));
      const colsFront = Math.max(1, Math.floor(seg.w / 0.7));
      const colsSide = Math.max(1, Math.floor(seg.d / 0.7));

      for (let r = 0; r < rows; r++) {
        const y = seg.y - seg.h / 2 + 0.4 + r * (seg.h / rows);
        for (let c = 0; c < colsFront; c++) {
          const x = seg.x - seg.w / 2 + 0.35 + c * ((seg.w - 0.4) / Math.max(1, colsFront - 1 || 1));
          wins.push({ pos: [x, y, seg.z + seg.d / 2 + 0.01], rot: [0, 0, 0], blinkId: blinkId++ });
          wins.push({ pos: [x, y, seg.z - seg.d / 2 - 0.01], rot: [0, Math.PI, 0], blinkId: blinkId++ });
        }
        for (let c = 0; c < colsSide; c++) {
          const z = seg.z - seg.d / 2 + 0.35 + c * ((seg.d - 0.4) / Math.max(1, colsSide - 1 || 1));
          wins.push({ pos: [seg.x + seg.w / 2 + 0.01, y, z], rot: [0, Math.PI / 2, 0], blinkId: blinkId++ });
          wins.push({ pos: [seg.x - seg.w / 2 - 0.01, y, z], rot: [0, -Math.PI / 2, 0], blinkId: blinkId++ });
        }
      }
    }

    return wins;
  }, [segments]);

  // Initialize blink timings per window
  const windowBlinkTimings = useMemo(() => {
    const totalWindows = windows.length;
    const timings = new Float32Array(totalWindows);
    for (let i = 0; i < totalWindows; i++) {
      timings[i] = seededRandom(seed + i * 31) * 100; // phase offset
    }
    windowBlinkRef.current = timings;
    return timings;
  }, [windows.length, seed]);

  const crown = useMemo(() => {
    const mainHeight = height;
    const topY = mainHeight;

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
            {/* Second shorter antenna */}
            <mesh position={[width * 0.25, 0.8, 0]}>
              <cylinderGeometry args={[0.02, 0.04, 1.6, 6]} />
              <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.3} />
            </mesh>
          </group>
        );
      case 'spire':
        return (
          <group position={[0, topY, 0]}>
            <mesh position={[0, 2, 0]}>
              <coneGeometry args={[width * 0.25, 4, 6]} />
              <meshPhysicalMaterial color={secondaryColor} roughness={0.3} metalness={0.7} />
            </mesh>
            {/* Flying buttress-like supports */}
            {[0, 1, 2, 3].map((i) => (
              <mesh key={`buttress-${i}`} position={[Math.cos(i * Math.PI / 2) * width * 0.3, 0.5, Math.sin(i * Math.PI / 2) * depth * 0.3]} rotation={[0, i * Math.PI / 2, Math.PI / 6]}>
                <boxGeometry args={[0.08, 1.2, 0.08]} />
                <meshPhysicalMaterial color={secondaryColor} roughness={0.4} metalness={0.6} />
              </mesh>
            ))}
          </group>
        );
      case 'dome':
        return (
          <group position={[0, topY, 0]}>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[Math.min(width, depth) * 0.5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshPhysicalMaterial color={secondaryColor} roughness={0.2} metalness={0.7} transparent opacity={0.85} />
            </mesh>
          </group>
        );
      case 'helipad':
        return (
          <group position={[0, topY, 0]}>
            {/* Flat roof */}
            <mesh position={[0, 0.05, 0]}>
              <boxGeometry args={[width * 1.1, 0.1, depth * 1.1]} />
              <meshPhysicalMaterial color={secondaryColor} roughness={0.5} metalness={0.5} />
            </mesh>
            {/* Helipad circle */}
            <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[width * 0.2, width * 0.35, 24]} />
              <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.8} side={THREE.DoubleSide} />
            </mesh>
            {/* Corner lights */}
            {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([xd, zd], i) => (
              <mesh key={`hpad-${i}`} position={[xd * width * 0.45, 0.2, zd * depth * 0.45]}>
                <sphereGeometry args={[0.06, 6, 6]} />
                <meshStandardMaterial color="#ff3333" emissive="#ff3333" emissiveIntensity={2} />
              </mesh>
            ))}
          </group>
        );
      case 'stepped':
        return (
          <group position={[0, topY, 0]}>
            {[0, 1, 2].map((i) => (
              <mesh key={`step-${i}`} position={[0, i * 0.35 + 0.175, 0]}>
                <boxGeometry args={[width * (0.9 - i * 0.2), 0.35, depth * (0.9 - i * 0.2)]} />
                <meshPhysicalMaterial color={i === 2 ? accentColor : secondaryColor} roughness={0.3} metalness={0.6} emissive={i === 2 ? accentColor : '#000000'} emissiveIntensity={i === 2 ? 0.4 : 0} />
              </mesh>
            ))}
          </group>
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
            {/* Center turret */}
            <mesh position={[0, 0.6, 0]}>
              <cylinderGeometry args={[0.15, 0.2, 1.2, 8]} />
              <meshPhysicalMaterial color={secondaryColor} roughness={0.6} metalness={0.4} />
            </mesh>
          </group>
        );
      case 'pitched':
        return (
          <mesh position={[0, topY + 0.4, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[width * 0.7, 0.8, 4]} />
            <meshPhysicalMaterial color={secondaryColor} roughness={0.8} metalness={0.1} />
          </mesh>
        );
      default:
        return (
          <mesh position={[0, topY + 0.05, 0]}>
            <boxGeometry args={[width * 0.9, 0.1, depth * 0.9]} />
            <meshPhysicalMaterial color={secondaryColor} roughness={0.5} metalness={0.5} />
          </mesh>
        );
    }
  }, [height, width, depth, config.crown, primaryColor, secondaryColor, accentColor]);

  const emissiveColor = accentColor;
  const baseEmissiveIntensity = style === 'neon-tower' ? windowGlow * 4 : windowGlow * 3;

  // Pulsing glow - some buildings pulse subtly
  const shouldPulse = buildingVariant > 0.4;

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
        <group key={`seg-group-${i}`}>
          {seg.isCylinder ? (
            <mesh position={[seg.x, seg.y, seg.z]} castShadow>
              <cylinderGeometry args={[seg.w / 2, seg.w / 2, seg.h, 24]} />
              <meshPhysicalMaterial
                color={i === 0 ? secondaryColor : primaryColor}
                emissive={primaryColor}
                emissiveIntensity={style === 'neon-tower' ? 0.6 : 0.35}
                roughness={Math.min(config.roughness, 0.4)}
                metalness={Math.max(config.metalness, 0.5)}
                transparent
                opacity={0.95}
              />
            </mesh>
          ) : (
            <mesh position={[seg.x, seg.y, seg.z]} castShadow>
              <boxGeometry args={[seg.w, seg.h, seg.d]} />
              <meshPhysicalMaterial
                color={i === 0 ? secondaryColor : primaryColor}
                emissive={primaryColor}
                emissiveIntensity={style === 'neon-tower' ? 0.6 : 0.35}
                roughness={Math.min(config.roughness, 0.4)}
                metalness={Math.max(config.metalness, 0.5)}
                transparent
                opacity={0.95}
              />
            </mesh>
          )}
        </group>
      ))}

      {/* Edge wireframe overlay for definition */}
      {segments.map((seg, i) => (
        seg.isCylinder ? (
          <mesh key={`wire-${i}`} position={[seg.x, seg.y, seg.z]}>
            <cylinderGeometry args={[seg.w / 2 + 0.01, seg.w / 2 + 0.01, seg.h + 0.02, 24]} />
            <meshBasicMaterial color={accentColor} wireframe transparent opacity={hovered ? 0.3 : 0.12} />
          </mesh>
        ) : (
          <mesh key={`wire-${i}`} position={[seg.x, seg.y, seg.z]}>
            <boxGeometry args={[seg.w + 0.02, seg.h + 0.02, seg.d + 0.02]} />
            <meshBasicMaterial color={accentColor} wireframe transparent opacity={hovered ? 0.3 : 0.12} />
          </mesh>
        )
      ))}

      {/* Windows with emissive glow and blinking */}
      {windows.map((w, i) => {
        // Some windows blink on/off
        const blinkPhase = windowBlinkTimings[w.blinkId % windowBlinkTimings.length];
        const shouldBlink = blinkPhase > 80; // ~20% of windows blink

        return (
          <WindowPane
            key={`win-${i}`}
            position={w.pos}
            rotation={w.rot}
            emissiveColor={emissiveColor}
            baseIntensity={baseEmissiveIntensity}
            shouldBlink={shouldBlink}
            blinkPhase={blinkPhase}
            shouldPulse={shouldPulse}
            seed={seed}
          />
        );
      })}

      {/* Crown */}
      {crown}

      {/* Base accent lights */}
      <pointLight position={[width * 0.6, 0.3, 0]} intensity={hovered ? 1.2 : 0.5} color={primaryColor} distance={6} />
      <pointLight position={[-width * 0.6, 0.3, 0]} intensity={hovered ? 1.2 : 0.5} color={primaryColor} distance={6} />
      <pointLight position={[0, 0.3, depth * 0.6]} intensity={hovered ? 1.2 : 0.5} color={primaryColor} distance={6} />

      {/* Neon edge glow on all buildings */}
      <mesh position={[0, height * 0.5, 0]}>
        <boxGeometry args={[width + 0.2, height + 0.2, depth + 0.2]} />
        <meshBasicMaterial color={accentColor} wireframe transparent opacity={hovered ? 0.3 : 0.1} />
      </mesh>

      {/* Pulsing ambient glow around building base */}
      {shouldPulse && (
        <PulsingGlow color={primaryColor} width={width} depth={depth} seed={seed} />
      )}

      {/* Current user beacon */}
      {isCurrentUser && (
        <>
          <UserBeacon height={height} width={width} depth={depth} />
          <Html position={[0, height + 4.5, 0]} center style={{ pointerEvents: 'none' }}>
            <div style={{
              background: 'rgba(29,185,84,0.15)',
              backdropFilter: 'blur(8px)',
              color: '#1DB954',
              padding: '4px 12px',
              borderRadius: '20px',
              fontFamily: 'system-ui, sans-serif',
              fontSize: '11px',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              border: '1px solid rgba(29,185,84,0.5)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              Your Building
            </div>
          </Html>
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

// Separate component for windows so they can animate independently
function WindowPane({ position, rotation, emissiveColor, baseIntensity, shouldBlink, blinkPhase, shouldPulse, seed }: {
  position: [number, number, number];
  rotation: [number, number, number];
  emissiveColor: string;
  baseIntensity: number;
  shouldBlink: boolean;
  blinkPhase: number;
  shouldPulse: boolean;
  seed: number;
}) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (!matRef.current) return;
    const t = state.clock.elapsedTime;
    let intensity = baseIntensity;

    if (shouldBlink) {
      // Blink: occasionally turn off
      const blink = Math.sin(t * 0.3 + blinkPhase) + Math.sin(t * 0.7 + blinkPhase * 1.3);
      if (blink < -1.2) {
        intensity = 0.05;
      }
    }

    if (shouldPulse) {
      intensity *= 0.8 + Math.sin(t * 0.8 + seed * 0.1) * 0.2;
    }

    matRef.current.emissiveIntensity = intensity;
  });

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[0.25, 0.35]} />
      <meshStandardMaterial
        ref={matRef}
        color="#ffffff"
        emissive={emissiveColor}
        emissiveIntensity={baseIntensity}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

// Animated beacon for the current user's building
function UserBeacon({ height, width, depth }: { height: number; width: number; depth: number }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef.current) {
      ringRef.current.rotation.y = t * 0.3;
      ringRef.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.08);
    }
    if (lightRef.current) {
      lightRef.current.intensity = 2 + Math.sin(t * 2) * 1;
    }
  });

  const radius = Math.max(width, depth) * 0.9;

  return (
    <>
      {/* Rotating ring at base */}
      <mesh ref={ringRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius, radius + 0.15, 48]} />
        <meshStandardMaterial color="#1DB954" emissive="#1DB954" emissiveIntensity={2} transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
      {/* Vertical beam */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.04, 0.04, height + 6, 8]} />
        <meshStandardMaterial color="#1DB954" emissive="#1DB954" emissiveIntensity={1.5} transparent opacity={0.25} />
      </mesh>
      {/* Bright point light */}
      <pointLight ref={lightRef} position={[0, height + 2, 0]} color="#1DB954" intensity={2} distance={25} />
    </>
  );
}

// Pulsing glow effect around building base
function PulsingGlow({ color, width, depth, seed }: { color: string; width: number; depth: number; seed: number }) {
  const ref = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.intensity = 0.3 + Math.sin(t * 1.2 + seed * 0.5) * 0.25;
  });

  return (
    <pointLight
      ref={ref}
      position={[0, 1, 0]}
      color={color}
      intensity={0.3}
      distance={Math.max(width, depth) * 3}
    />
  );
}
