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
  const { height, width, depth, primaryColor, secondaryColor, accentColor, windowGlow, style, position, profile, isCurrentUser, dimmed, highlighted } = params;
  const config = getStyleConfig(style);

  const seed = position[0] * 73 + position[2] * 137;
  const buildingVariant = seededRandom(seed);

  const opacityRef = useRef(1);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    const pulseScale = highlighted ? Math.sin(t * 3) * 0.03 : 0;
    const targetScale = hovered ? 1.04 : 1 + pulseScale;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);

    groupRef.current.position.y = Math.sin(t * 0.4 + position[0] * 0.3) * 0.06;

    // Smooth opacity for dimming
    const targetOpacity = dimmed ? 0.15 : 1;
    opacityRef.current += (targetOpacity - opacityRef.current) * 0.06;

    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.Material & { opacity: number };
        if (mat.opacity !== undefined) {
          if (!mat.userData.baseOpacity) mat.userData.baseOpacity = mat.opacity;
          mat.transparent = true;
          mat.opacity = Math.min(mat.userData.baseOpacity, opacityRef.current);
        }
      }
    });
  });

  // Generate footprint geometry pieces
  const footprintPieces = useMemo(() => {
    const pieces: { x: number; z: number; w: number; d: number; isMain: boolean }[] = [];

    switch (config.footprint) {
      case 'l-shape': {
        pieces.push({ x: 0, z: 0, w: width, d: depth, isMain: true });
        pieces.push({ x: width * 0.35, z: depth * 0.35, w: width * 0.55, d: depth * 0.55, isMain: false });
        break;
      }
      case 't-shape': {
        pieces.push({ x: 0, z: 0, w: width * 0.6, d: depth, isMain: true });
        pieces.push({ x: 0, z: 0, w: width * 1.3, d: depth * 0.45, isMain: false });
        break;
      }
      case 'cluster': {
        pieces.push({ x: 0, z: 0, w: width * 0.7, d: depth * 0.7, isMain: true });
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
    const allSegs: { y: number; h: number; w: number; d: number; x: number; z: number; isCylinder: boolean; segIndex: number; segTotal: number }[] = [];

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
        segIndex: 0,
        segTotal: segCount,
      });

      // Body segments with taper
      for (let i = 1; i < segCount; i++) {
        let scale = Math.pow(config.taperFactor, i);
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
          segIndex: i,
          segTotal: segCount,
        });
      }
    }
    return allSegs;
  }, [height, width, depth, config, footprintPieces, buildingVariant]);

  // Compute per-segment gradient colors: bottom darker, top lighter/more emissive
  const segmentColors = useMemo(() => {
    const primary = new THREE.Color(primaryColor);
    const secondary = new THREE.Color(secondaryColor);
    const accent = new THREE.Color(accentColor);

    return segments.map((seg) => {
      const t = seg.segTotal > 1 ? seg.segIndex / (seg.segTotal - 1) : 0;
      // Bottom segments: darker (lerp toward secondary/black), top: lighter/more emissive
      const darkFactor = 0.55 + t * 0.45; // 0.55 at bottom, 1.0 at top
      const baseColor = primary.clone().multiplyScalar(darkFactor);
      // Blend a touch of accent at the very top
      if (t > 0.7) {
        const accentBlend = (t - 0.7) / 0.3 * 0.15;
        baseColor.lerp(accent.clone(), accentBlend);
      }
      const emissiveIntensity = style === 'neon-tower'
        ? 0.3 + t * 0.5
        : 0.15 + t * 0.35;
      return {
        color: '#' + baseColor.getHexString(),
        lobbyColor: '#' + secondary.getHexString(),
        emissiveIntensity,
      };
    });
  }, [segments, primaryColor, secondaryColor, accentColor, style]);

  // Generate static window positions and merge into a single geometry with per-window brightness
  const windowGeometry = useMemo(() => {
    const windowPositions: { pos: [number, number, number]; rot: [number, number, number]; segIdx: number }[] = [];

    for (let si = 0; si < segments.length; si++) {
      const seg = segments[si];
      if (seg.isCylinder) {
        const radius = seg.w / 2;
        const rows = Math.max(1, Math.floor(seg.h / 1.0));
        const cols = Math.max(4, Math.floor(radius * Math.PI * 2 / 0.7));
        for (let r = 0; r < rows; r++) {
          const y = seg.y - seg.h / 2 + 0.4 + r * (seg.h / rows);
          for (let c = 0; c < cols; c++) {
            const angle = (c / cols) * Math.PI * 2;
            const wx = seg.x + Math.cos(angle) * (radius + 0.01);
            const wz = seg.z + Math.sin(angle) * (radius + 0.01);
            windowPositions.push({ pos: [wx, y, wz], rot: [0, -angle + Math.PI / 2, 0], segIdx: si });
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
          windowPositions.push({ pos: [x, y, seg.z + seg.d / 2 + 0.01], rot: [0, 0, 0], segIdx: si });
          windowPositions.push({ pos: [x, y, seg.z - seg.d / 2 - 0.01], rot: [0, Math.PI, 0], segIdx: si });
        }
        for (let c = 0; c < colsSide; c++) {
          const z = seg.z - seg.d / 2 + 0.35 + c * ((seg.d - 0.4) / Math.max(1, colsSide - 1 || 1));
          windowPositions.push({ pos: [seg.x + seg.w / 2 + 0.01, y, z], rot: [0, Math.PI / 2, 0], segIdx: si });
          windowPositions.push({ pos: [seg.x - seg.w / 2 - 0.01, y, z], rot: [0, -Math.PI / 2, 0], segIdx: si });
        }
      }
    }

    // Merge all windows into a single BufferGeometry with vertex colors for brightness variation
    const winW = 0.25;
    const winH = 0.35;
    const vertCount = windowPositions.length * 4;
    const triCount = windowPositions.length * 2;
    const positions = new Float32Array(vertCount * 3);
    const colors = new Float32Array(vertCount * 3);
    const indices = new Uint32Array(triCount * 3);

    const halfW = winW / 2;
    const halfH = winH / 2;
    const corners = [
      [-halfW, -halfH, 0],
      [halfW, -halfH, 0],
      [halfW, halfH, 0],
      [-halfW, halfH, 0],
    ];

    const euler = new THREE.Euler();
    const quat = new THREE.Quaternion();
    const vec = new THREE.Vector3();

    for (let i = 0; i < windowPositions.length; i++) {
      const { pos, rot, segIdx } = windowPositions[i];
      euler.set(rot[0], rot[1], rot[2]);
      quat.setFromEuler(euler);

      // Vary window brightness: some bright (lit), some dim (dark/off)
      // Use deterministic hash per window
      const winSeed = seed + i * 31.7 + segIdx * 17.3;
      const winRand = seededRandom(winSeed);
      // 25% windows are dim/off, 50% normal, 25% extra bright
      let brightness: number;
      if (winRand < 0.25) {
        brightness = 0.08 + winRand * 0.5; // dim: 0.08-0.2
      } else if (winRand < 0.75) {
        brightness = 0.5 + (winRand - 0.25) * 1.0; // normal: 0.5-1.0
      } else {
        brightness = 1.0 + (winRand - 0.75) * 1.6; // bright: 1.0-1.4
      }

      for (let j = 0; j < 4; j++) {
        vec.set(corners[j][0], corners[j][1], corners[j][2]);
        vec.applyQuaternion(quat);
        vec.x += pos[0];
        vec.y += pos[1];
        vec.z += pos[2];
        const idx = (i * 4 + j) * 3;
        positions[idx] = vec.x;
        positions[idx + 1] = vec.y;
        positions[idx + 2] = vec.z;
        // Store brightness in vertex color (white * brightness)
        colors[idx] = brightness;
        colors[idx + 1] = brightness;
        colors[idx + 2] = brightness;
      }

      const base = i * 4;
      const triBase = i * 6;
      indices[triBase] = base;
      indices[triBase + 1] = base + 1;
      indices[triBase + 2] = base + 2;
      indices[triBase + 3] = base;
      indices[triBase + 4] = base + 2;
      indices[triBase + 5] = base + 3;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setIndex(new THREE.BufferAttribute(indices, 1));
    geo.computeVertexNormals();
    return geo;
  }, [segments, seed]);

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
            <mesh position={[0, 0.05, 0]}>
              <boxGeometry args={[width * 1.1, 0.1, depth * 1.1]} />
              <meshPhysicalMaterial color={secondaryColor} roughness={0.5} metalness={0.5} />
            </mesh>
            <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[width * 0.2, width * 0.35, 24]} />
              <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.8} side={THREE.DoubleSide} />
            </mesh>
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

  return (
    <group
      ref={groupRef}
      position={[position[0], 0, position[2]]}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      onClick={(e) => { e.stopPropagation(); onClick(params); }}
    >
      {/* Ground glow under building */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[Math.max(width, depth) * 1.2, 24]} />
        <meshBasicMaterial
          color={primaryColor}
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Building segments with gradient coloring */}
      {segments.map((seg, i) => (
        <group key={`seg-group-${i}`}>
          {seg.isCylinder ? (
            <mesh position={[seg.x, seg.y, seg.z]}>
              <cylinderGeometry args={[seg.w / 2, seg.w / 2, seg.h, 24]} />
              <meshPhysicalMaterial
                color={i === 0 ? segmentColors[i].lobbyColor : segmentColors[i].color}
                emissive={primaryColor}
                emissiveIntensity={segmentColors[i].emissiveIntensity}
                roughness={Math.min(config.roughness, 0.4)}
                metalness={Math.max(config.metalness, 0.5)}
                transparent
                opacity={0.95}
              />
            </mesh>
          ) : (
            <mesh position={[seg.x, seg.y, seg.z]}>
              <boxGeometry args={[seg.w, seg.h, seg.d]} />
              <meshPhysicalMaterial
                color={i === 0 ? segmentColors[i].lobbyColor : segmentColors[i].color}
                emissive={primaryColor}
                emissiveIntensity={segmentColors[i].emissiveIntensity}
                roughness={Math.min(config.roughness, 0.4)}
                metalness={Math.max(config.metalness, 0.5)}
                transparent
                opacity={0.95}
              />
            </mesh>
          )}
        </group>
      ))}

      {/* Edge wireframe overlay - only when hovered */}
      {hovered && segments.map((seg, i) => (
        seg.isCylinder ? (
          <mesh key={`wire-${i}`} position={[seg.x, seg.y, seg.z]}>
            <cylinderGeometry args={[seg.w / 2 + 0.01, seg.w / 2 + 0.01, seg.h + 0.02, 24]} />
            <meshBasicMaterial color={accentColor} wireframe transparent opacity={0.3} />
          </mesh>
        ) : (
          <mesh key={`wire-${i}`} position={[seg.x, seg.y, seg.z]}>
            <boxGeometry args={[seg.w + 0.02, seg.h + 0.02, seg.d + 0.02]} />
            <meshBasicMaterial color={accentColor} wireframe transparent opacity={0.3} />
          </mesh>
        )
      ))}

      {/* All windows as a single merged mesh with vertex color brightness variation */}
      <mesh geometry={windowGeometry}>
        <meshStandardMaterial
          color="#ffffff"
          emissive={emissiveColor}
          emissiveIntensity={baseEmissiveIntensity}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
          vertexColors
        />
      </mesh>

      {/* Crown */}
      {crown}

      {/* Glow halo at top of tall buildings */}
      {height > 15 && (
        <mesh position={[0, height + 0.5, 0]}>
          <sphereGeometry args={[width * 0.8, 16, 16]} />
          <meshBasicMaterial
            color={accentColor}
            transparent
            opacity={0.06}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Single accent light per building */}
      <pointLight position={[0, 0.3, 0]} intensity={hovered ? 1.2 : 0.5} color={primaryColor} distance={6} />

      {/* Neon edge glow - only when hovered */}
      {hovered && (
        <mesh position={[0, height * 0.5, 0]}>
          <boxGeometry args={[width + 0.2, height + 0.2, depth + 0.2]} />
          <meshBasicMaterial color={accentColor} wireframe transparent opacity={0.3} />
        </mesh>
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
      <mesh ref={ringRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius, radius + 0.15, 48]} />
        <meshStandardMaterial color="#1DB954" emissive="#1DB954" emissiveIntensity={2} transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.04, 0.04, height + 6, 8]} />
        <meshStandardMaterial color="#1DB954" emissive="#1DB954" emissiveIntensity={1.5} transparent opacity={0.25} />
      </mesh>
      <pointLight ref={lightRef} position={[0, height + 2, 0]} color="#1DB954" intensity={2} distance={25} />
    </>
  );
}
