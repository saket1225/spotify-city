'use client';

import { useRef, useState, useMemo, useCallback, useEffect, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { BuildingParams, BuildingStyle } from '@/types';

interface BuildingProps {
  params: BuildingParams;
  onClick: (params: BuildingParams) => void;
  constructionDelay?: number;
  constructionElapsedRef?: React.MutableRefObject<number>;
  cameraPosition?: React.MutableRefObject<THREE.Vector3>;
}

function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function seededRange(seed: number, min: number, max: number) {
  return min + seededRandom(seed) * (max - min);
}

/* ── Art Deco Building (Jazz/Classical) ── */
function ArtDecoBuilding({ height, width, depth, primaryColor, secondaryColor, accentColor, seed }: {
  height: number; width: number; depth: number; primaryColor: string; secondaryColor: string; accentColor: string; seed: number;
}) {
  const tiers = Math.max(3, Math.floor(height / 3));

  return (
    <group>
      {/* Main tower with setbacks */}
      {Array.from({ length: tiers }, (_, i) => {
        const t = i / tiers;
        const tierH = height / tiers;
        const scale = 1 - t * 0.4;
        const setback = t > 0.3 ? (t - 0.3) * 0.3 : 0;
        return (
          <mesh key={`tier-${i}`} position={[0, tierH * (i + 0.5), 0]}>
            <boxGeometry args={[width * (scale - setback), tierH - 0.03, depth * (scale - setback)]} />
            <meshPhysicalMaterial
              color={i % 2 === 0 ? primaryColor : secondaryColor}
              roughness={0.3}
              metalness={0.7}
              emissive={primaryColor}
              emissiveIntensity={0.1 + t * 0.2}
            />
          </mesh>
        );
      })}

      {/* Art deco crown - stepped pyramid */}
      <group position={[0, height, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={`crown-${i}`} position={[0, i * 0.5 + 0.25, 0]}>
            <boxGeometry args={[width * (0.6 - i * 0.15), 0.5, depth * (0.6 - i * 0.15)]} />
            <meshPhysicalMaterial color={accentColor} metalness={0.9} roughness={0.1} emissive={accentColor} emissiveIntensity={0.3} />
          </mesh>
        ))}
        {/* Spire */}
        <mesh position={[0, 2, 0]}>
          <coneGeometry args={[0.12, 2.5, 6]} />
          <meshPhysicalMaterial color={accentColor} metalness={0.95} roughness={0.05} emissive={accentColor} emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* Vertical decorative ridges */}
      {[-1, 1].map((side) => (
        <mesh key={`ridge-${side}`} position={[side * width * 0.48, height * 0.5, 0]}>
          <boxGeometry args={[0.08, height, 0.08]} />
          <meshPhysicalMaterial color={accentColor} metalness={0.8} roughness={0.2} emissive={accentColor} emissiveIntensity={0.2} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={`ridge-z-${side}`} position={[0, height * 0.5, side * depth * 0.48]}>
          <boxGeometry args={[0.08, height, 0.08]} />
          <meshPhysicalMaterial color={accentColor} metalness={0.8} roughness={0.2} emissive={accentColor} emissiveIntensity={0.2} />
        </mesh>
      ))}

      {/* Ornamental arched windows */}
      {Array.from({ length: Math.floor(height / 2) }, (_, i) => {
        const y = 1 + i * 2;
        if (y > height - 1) return null;
        return (
          <group key={`arch-row-${i}`}>
            {[-1, 1].map((side) => (
              <group key={`arch-${side}-${i}`} position={[side * width * 0.51, y, 0]}>
                <mesh>
                  <planeGeometry args={[0.4, 0.7]} />
                  <meshStandardMaterial
                    color="#ffffff"
                    emissive={accentColor}
                    emissiveIntensity={seededRange(seed + i * side, 0.5, 2.0)}
                    transparent opacity={0.85}
                    side={THREE.DoubleSide}
                  />
                </mesh>
                {/* Arch top */}
                <mesh position={[0, 0.4, 0]} rotation={[0, 0, 0]}>
                  <circleGeometry args={[0.2, 8, 0, Math.PI]} />
                  <meshStandardMaterial
                    color="#ffffff"
                    emissive={accentColor}
                    emissiveIntensity={seededRange(seed + i * side, 0.5, 2.0)}
                    transparent opacity={0.85}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              </group>
            ))}
          </group>
        );
      })}

      {/* Decorative horizontal bands */}
      {[0.25, 0.5, 0.75].map((t) => (
        <mesh key={`band-${t}`} position={[0, height * t, 0]}>
          <boxGeometry args={[width * 1.05, 0.06, depth * 1.05]} />
          <meshPhysicalMaterial color={accentColor} metalness={0.9} roughness={0.1} emissive={accentColor} emissiveIntensity={0.15} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Futuristic Glass Tower (Electronic) ── */
function FuturisticTower({ height, width, depth, primaryColor, secondaryColor, accentColor, seed }: {
  height: number; width: number; depth: number; primaryColor: string; secondaryColor: string; accentColor: string; seed: number;
}) {
  const twist = seededRange(seed, 0.02, 0.06);
  const rings = Math.floor(height / 2.5);

  return (
    <group>
      {/* Main glass cylinder - reduced segments: 32 → 8 */}
      <mesh position={[0, height * 0.5, 0]}>
        <cylinderGeometry args={[width * 0.45, width * 0.5, height, 8]} />
        <meshPhysicalMaterial
          color={primaryColor}
          roughness={0.05}
          metalness={0.3}
          transmission={0.4}
          transparent
          opacity={0.7}
          emissive={primaryColor}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Inner core - reduced segments: 16 → 8 */}
      <mesh position={[0, height * 0.5, 0]}>
        <cylinderGeometry args={[width * 0.2, width * 0.22, height * 0.95, 8]} />
        <meshPhysicalMaterial
          color={secondaryColor}
          roughness={0.2}
          metalness={0.8}
          emissive={accentColor}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Floating LED rings - reduced torus segments */}
      <group>
      {Array.from({ length: rings }, (_, i) => {
        const y = 1.5 + i * (height / rings);
        const pulse = seededRandom(seed + i * 37) > 0.5;
        return (
          <group key={`ring-${i}`} position={[0, y, 0]} rotation={[0, i * twist * 10, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[width * 0.55, 0.04, 4, 12]} />
              <meshStandardMaterial
                color={pulse ? accentColor : primaryColor}
                emissive={pulse ? accentColor : primaryColor}
                emissiveIntensity={pulse ? 1.5 : 0.5}
              />
            </mesh>
          </group>
        );
      })}
      </group>

      {/* Holographic top - NO pointLight beacon */}
      <group position={[0, height, 0]}>
        <mesh position={[0, 0.8, 0]}>
          <octahedronGeometry args={[width * 0.35, 0]} />
          <meshPhysicalMaterial
            color={accentColor}
            roughness={0.0}
            metalness={1.0}
            emissive={accentColor}
            emissiveIntensity={2.0}
            transparent
            opacity={0.8}
          />
        </mesh>
      </group>

      {/* Vertical LED strips */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2;
        const x = Math.cos(angle) * width * 0.46;
        const z = Math.sin(angle) * width * 0.46;
        return (
          <mesh key={`strip-${i}`} position={[x, height * 0.5, z]}>
            <boxGeometry args={[0.04, height * 0.9, 0.04]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={1.2}
            />
          </mesh>
        );
      })}

      {/* Data panel windows */}
      {Array.from({ length: Math.floor(height / 1.5) }, (_, i) => {
        const y = 0.8 + i * 1.5;
        if (y > height - 1) return null;
        const angle = (i * 0.7) + seed;
        return (
          <mesh key={`panel-${i}`} position={[Math.cos(angle) * width * 0.51, y, Math.sin(angle) * width * 0.51]}
            rotation={[0, -angle + Math.PI / 2, 0]}>
            <planeGeometry args={[0.6, 0.3]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive={accentColor}
              emissiveIntensity={seededRange(seed + i * 17, 0.3, 2.5)}
              transparent opacity={0.9}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/* ── Industrial Fortress (Rock/Metal) ── */
function IndustrialFortress({ height, width, depth, primaryColor, secondaryColor, accentColor, seed }: {
  height: number; width: number; depth: number; primaryColor: string; secondaryColor: string; accentColor: string; seed: number;
}) {

  return (
    <group>
      {/* Main massive block */}
      <mesh position={[0, height * 0.4, 0]}>
        <boxGeometry args={[width * 1.1, height * 0.8, depth * 1.1]} />
        <meshPhysicalMaterial color={primaryColor} roughness={0.7} metalness={0.5} emissive={primaryColor} emissiveIntensity={0.08} />
      </mesh>

      {/* Upper narrower section */}
      <mesh position={[0, height * 0.85, 0]}>
        <boxGeometry args={[width * 0.85, height * 0.3, depth * 0.85]} />
        <meshPhysicalMaterial color={secondaryColor} roughness={0.6} metalness={0.6} emissive={primaryColor} emissiveIntensity={0.1} />
      </mesh>

      {/* Corner turrets */}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([xd, zd], i) => (
        <group key={`turret-${i}`} position={[xd * width * 0.5, 0, zd * depth * 0.5]}>
          <mesh position={[0, height * 0.5, 0]}>
            <cylinderGeometry args={[width * 0.15, width * 0.18, height, 8]} />
            <meshPhysicalMaterial color={secondaryColor} roughness={0.6} metalness={0.5} emissive={primaryColor} emissiveIntensity={0.05} />
          </mesh>
          {/* Turret cap */}
          <mesh position={[0, height + 0.3, 0]}>
            <coneGeometry args={[width * 0.18, 0.8, 8]} />
            <meshPhysicalMaterial color={accentColor} roughness={0.5} metalness={0.4} />
          </mesh>
          {/* Battlements */}
          {[0, 1, 2, 3].map((j) => {
            const a = (j / 4) * Math.PI * 2;
            return (
              <mesh key={`batt-${j}`} position={[Math.cos(a) * width * 0.15, height + 0.15, Math.sin(a) * width * 0.15]}>
                <boxGeometry args={[0.15, 0.3, 0.15]} />
                <meshPhysicalMaterial color={secondaryColor} roughness={0.7} metalness={0.3} />
              </mesh>
            );
          })}
        </group>
      ))}

      {/* Industrial pipes */}
      {[0, 1].map((i) => {
        const side = i === 0 ? 1 : -1;
        return (
          <group key={`pipe-${i}`}>
            <mesh position={[side * width * 0.6, height * 0.3, 0]} rotation={[0, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, height * 0.7, 8]} />
              <meshPhysicalMaterial color="#555555" roughness={0.3} metalness={0.9} />
            </mesh>
            {/* Pipe brackets */}
            {[0.2, 0.5, 0.8].map((t) => (
              <mesh key={`bracket-${t}`} position={[side * width * 0.6, height * t, 0]}>
                <torusGeometry args={[0.12, 0.03, 6, 12]} />
                <meshPhysicalMaterial color="#444444" roughness={0.4} metalness={0.8} />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* Smoke stacks */}
      <mesh position={[width * 0.25, height + 0.6, -depth * 0.2]}>
        <cylinderGeometry args={[0.12, 0.15, 1.2, 8]} />
        <meshPhysicalMaterial color="#444444" roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[-width * 0.15, height + 0.8, depth * 0.15]}>
        <cylinderGeometry args={[0.1, 0.13, 1.6, 8]} />
        <meshPhysicalMaterial color="#444444" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* Heavy-duty windows - small and sparse */}
      {Array.from({ length: Math.floor(height / 2.5) }, (_, i) => {
        const y = 1.5 + i * 2.5;
        if (y > height * 0.8) return null;
        return (
          <group key={`win-row-${i}`}>
            {[-1, 1].map((side) => (
              <group key={`win-${side}-${i}`}>
                <mesh position={[side * width * 0.56, y, 0]}>
                  <planeGeometry args={[0.5, 0.3]} />
                  <meshStandardMaterial
                    color="#ffaa44"
                    emissive="#ff8800"
                    emissiveIntensity={seededRange(seed + i * side * 7, 0.3, 1.5)}
                    transparent opacity={0.85}
                    side={THREE.DoubleSide}
                  />
                </mesh>
                <mesh position={[0, y, side * depth * 0.56]}>
                  <planeGeometry args={[0.5, 0.3]} />
                  <meshStandardMaterial
                    color="#ffaa44"
                    emissive="#ff8800"
                    emissiveIntensity={seededRange(seed + i * side * 13, 0.3, 1.5)}
                    transparent opacity={0.85}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              </group>
            ))}
          </group>
        );
      })}

      {/* Warning light on top - emissive sphere only, NO pointLight */}
      <mesh position={[0, height + 1.2, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ff3333" emissive="#ff3333" emissiveIntensity={3} />
      </mesh>
    </group>
  );
}

/* ── Graffiti Tower (Hip-Hop) ── */
function GraffitiTower({ height, width, depth, primaryColor, secondaryColor, accentColor, seed }: {
  height: number; width: number; depth: number; primaryColor: string; secondaryColor: string; accentColor: string; seed: number;
}) {
  const setbacks = Math.max(2, Math.floor(height / 5));

  return (
    <group>
      {/* Stepped setback tower */}
      {Array.from({ length: setbacks }, (_, i) => {
        const t = i / setbacks;
        const tierH = height / setbacks;
        const scale = 1 - t * 0.25;
        // Alternate offset for hip-hop asymmetry
        const offsetX = i % 2 === 0 ? 0 : width * 0.08;
        return (
          <mesh key={`tier-${i}`} position={[offsetX, tierH * (i + 0.5), 0]}>
            <boxGeometry args={[width * scale, tierH - 0.02, depth * scale]} />
            <meshPhysicalMaterial
              color={t < 0.5 ? primaryColor : secondaryColor}
              roughness={0.5}
              metalness={0.4}
              emissive={primaryColor}
              emissiveIntensity={0.1 + t * 0.15}
            />
          </mesh>
        );
      })}

      {/* Graffiti color panels on sides */}
      {Array.from({ length: Math.floor(height / 2) }, (_, i) => {
        const y = 0.5 + i * 2;
        if (y > height - 1) return null;
        const colors = ['#FF1493', '#FFD700', '#00FF7F', '#FF4500', '#7B68EE', '#00CED1'];
        const color = colors[Math.floor(seededRandom(seed + i * 31) * colors.length)];
        const side = seededRandom(seed + i * 71) > 0.5 ? 1 : -1;
        const face = seededRandom(seed + i * 91) > 0.5; // front/back or sides
        const panelW = seededRange(seed + i * 11, 0.3, 0.8);
        const panelH = seededRange(seed + i * 23, 0.4, 1.0);
        return face ? (
          <mesh key={`graffiti-${i}`} position={[side * width * 0.51, y, seededRange(seed + i, -depth * 0.3, depth * 0.3)]}>
            <planeGeometry args={[panelW, panelH]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.9} side={THREE.DoubleSide} />
          </mesh>
        ) : (
          <mesh key={`graffiti-${i}`} position={[seededRange(seed + i, -width * 0.3, width * 0.3), y, side * depth * 0.51]}>
            <planeGeometry args={[panelW, panelH]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.9} side={THREE.DoubleSide} />
          </mesh>
        );
      })}

      {/* Rooftop water tower */}
      <group position={[width * 0.2, height, -depth * 0.15]}>
        {/* Legs */}
        {[[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]].map(([x, z], i) => (
          <mesh key={`leg-${i}`} position={[x, 0.3, z]}>
            <boxGeometry args={[0.04, 0.6, 0.04]} />
            <meshPhysicalMaterial color="#555555" roughness={0.5} metalness={0.7} />
          </mesh>
        ))}
        {/* Tank */}
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.5, 12]} />
          <meshPhysicalMaterial color="#3a3a3a" roughness={0.6} metalness={0.5} />
        </mesh>
        <mesh position={[0, 1.1, 0]}>
          <coneGeometry args={[0.27, 0.15, 12]} />
          <meshPhysicalMaterial color="#3a3a3a" roughness={0.6} metalness={0.5} />
        </mesh>
      </group>

      {/* Billboard/sign at the top */}
      <group position={[-width * 0.1, height + 0.5, depth * 0.35]}>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[width * 0.6, 0.5, 0.05]} />
          <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.8} />
        </mesh>
        {/* Sign posts */}
        {[-0.2, 0.2].map((x, i) => (
          <mesh key={`post-${i}`} position={[x, 0.1, 0]}>
            <boxGeometry args={[0.03, 0.5, 0.03]} />
            <meshPhysicalMaterial color="#555" roughness={0.5} metalness={0.7} />
          </mesh>
        ))}
      </group>

      {/* Regular windows */}
      {Array.from({ length: Math.floor(height / 1.2) }, (_, i) => {
        const y = 0.8 + i * 1.2;
        if (y > height - 0.5) return null;
        return (
          <group key={`win-${i}`}>
            {[-1, 1].map((side) => (
              <mesh key={`w-${side}`} position={[side * width * 0.52, y, 0]}>
                <planeGeometry args={[0.25, 0.35]} />
                <meshStandardMaterial
                  color="#ffffff"
                  emissive={accentColor}
                  emissiveIntensity={seededRange(seed + i * side * 3, 0.2, 1.8)}
                  transparent opacity={0.85}
                  side={THREE.DoubleSide}
                />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}

/* ── Colorful Modern Tower (Pop) ── */
function PopTower({ height, width, depth, primaryColor, secondaryColor, accentColor, seed }: {
  height: number; width: number; depth: number; primaryColor: string; secondaryColor: string; accentColor: string; seed: number;
}) {
  const segments = Math.max(4, Math.floor(height / 2));

  return (
    <group>
      {/* Clean glass tower with colorful segments */}
      {Array.from({ length: segments }, (_, i) => {
        const t = i / segments;
        const segH = height / segments;
        const taper = 1 - t * 0.15;
        const colors = [primaryColor, accentColor, secondaryColor];
        const color = colors[i % 3];
        return (
          <mesh key={`seg-${i}`} position={[0, segH * (i + 0.5), 0]}>
            <boxGeometry args={[width * taper, segH - 0.04, depth * taper]} />
            <meshPhysicalMaterial
              color={color}
              roughness={0.08}
              metalness={0.7}
              emissive={color}
              emissiveIntensity={0.12 + t * 0.2}
              transparent
              opacity={0.9}
            />
          </mesh>
        );
      })}

      {/* Glass curtain wall highlight */}
      <mesh position={[0, height * 0.5, depth * 0.51]}>
        <planeGeometry args={[width * 0.8, height * 0.9]} />
        <meshPhysicalMaterial
          color={primaryColor}
          roughness={0.0}
          metalness={0.2}
          transmission={0.3}
          transparent
          opacity={0.3}
          emissive={accentColor}
          emissiveIntensity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Rooftop garden */}
      <group position={[0, height + 0.05, 0]}>
        {/* Green roof pad */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[width * 0.9, 0.1, depth * 0.9]} />
          <meshPhysicalMaterial color="#1a5c1a" roughness={0.9} metalness={0.0} />
        </mesh>
        {/* Small trees */}
        {Array.from({ length: 3 }, (_, i) => {
          const tx = seededRange(seed + i * 47, -width * 0.3, width * 0.3);
          const tz = seededRange(seed + i * 67, -depth * 0.3, depth * 0.3);
          return (
            <group key={`tree-${i}`} position={[tx, 0.05, tz]}>
              <mesh position={[0, 0.15, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.3, 4]} />
                <meshStandardMaterial color="#4a3520" />
              </mesh>
              <mesh position={[0, 0.35, 0]}>
                <sphereGeometry args={[0.12, 6, 6]} />
                <meshStandardMaterial color="#2d7a2d" emissive="#1a4a1a" emissiveIntensity={0.1} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Big grid windows - reduced density: height/0.9 → height/1.8 */}
      {Array.from({ length: Math.floor(height / 1.8) }, (_, i) => {
        const y = 0.5 + i * 1.8;
        if (y > height - 0.5) return null;
        const cols = Math.max(2, Math.floor(width / 0.5));
        return (
          <group key={`row-${i}`}>
            {Array.from({ length: cols }, (_, c) => {
              const x = -width * 0.4 + c * (width * 0.8 / Math.max(1, cols - 1));
              return (
                <group key={`w-${c}`}>
                  <mesh position={[x, y, depth * 0.51]}>
                    <planeGeometry args={[0.22, 0.32]} />
                    <meshStandardMaterial
                      color="#ffffff"
                      emissive={primaryColor}
                      emissiveIntensity={seededRange(seed + i * 7 + c * 13, 0.2, 2.0)}
                      transparent opacity={0.85}
                      side={THREE.DoubleSide}
                    />
                  </mesh>
                  <mesh position={[x, y, -depth * 0.51]}>
                    <planeGeometry args={[0.22, 0.32]} />
                    <meshStandardMaterial
                      color="#ffffff"
                      emissive={primaryColor}
                      emissiveIntensity={seededRange(seed + i * 11 + c * 17, 0.2, 2.0)}
                      transparent opacity={0.85}
                      side={THREE.DoubleSide}
                    />
                  </mesh>
                </group>
              );
            })}
          </group>
        );
      })}

      {/* Antenna with blinking light */}
      <mesh position={[0, height + 1, 0]}>
        <cylinderGeometry args={[0.03, 0.05, 2, 6]} />
        <meshStandardMaterial color="#cccccc" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, height + 2.1, 0]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

/* ── Warm Brownstone (Indie/Folk) ── */
function BrownstoneBuild({ height, width, depth, primaryColor, secondaryColor, accentColor, seed }: {
  height: number; width: number; depth: number; primaryColor: string; secondaryColor: string; accentColor: string; seed: number;
}) {
  const hasExtension = seededRandom(seed + 99) > 0.4;

  return (
    <group>
      {/* Main building */}
      <mesh position={[0, height * 0.5, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshPhysicalMaterial color={primaryColor} roughness={0.7} metalness={0.2} emissive={primaryColor} emissiveIntensity={0.05} />
      </mesh>

      {/* Side extension */}
      {hasExtension && (
        <mesh position={[width * 0.45, height * 0.3, depth * 0.1]}>
          <boxGeometry args={[width * 0.4, height * 0.6, depth * 0.7]} />
          <meshPhysicalMaterial color={secondaryColor} roughness={0.7} metalness={0.2} emissive={primaryColor} emissiveIntensity={0.05} />
        </mesh>
      )}

      {/* Pitched roof */}
      <group position={[0, height, 0]}>
        <mesh position={[0, 0.35, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[width * 0.75, 0.7, 4]} />
          <meshPhysicalMaterial color={secondaryColor} roughness={0.85} metalness={0.1} />
        </mesh>
        {/* Chimney */}
        <mesh position={[width * 0.25, 0.5, -depth * 0.15]}>
          <boxGeometry args={[0.2, 0.7, 0.2]} />
          <meshPhysicalMaterial color="#8B4513" roughness={0.8} metalness={0.1} />
        </mesh>
      </group>

      {/* Balconies */}
      {Array.from({ length: Math.min(3, Math.floor(height / 3)) }, (_, i) => {
        const y = 2 + i * 3;
        if (y > height - 1) return null;
        return (
          <group key={`balcony-${i}`} position={[0, y, depth * 0.5]}>
            {/* Floor */}
            <mesh position={[0, 0, 0.2]}>
              <boxGeometry args={[width * 0.5, 0.06, 0.4]} />
              <meshPhysicalMaterial color="#555555" roughness={0.5} metalness={0.6} />
            </mesh>
            {/* Railing */}
            <mesh position={[0, 0.2, 0.38]}>
              <boxGeometry args={[width * 0.5, 0.04, 0.02]} />
              <meshPhysicalMaterial color="#444444" roughness={0.4} metalness={0.7} />
            </mesh>
            {/* Railing posts */}
            {[-0.2, 0, 0.2].map((x, j) => (
              <mesh key={`rail-${j}`} position={[x, 0.1, 0.38]}>
                <boxGeometry args={[0.02, 0.2, 0.02]} />
                <meshPhysicalMaterial color="#444444" roughness={0.4} metalness={0.7} />
              </mesh>
            ))}
            {/* Plant box */}
            {seededRandom(seed + i * 19) > 0.4 && (
              <mesh position={[0, 0.12, 0.25]}>
                <boxGeometry args={[0.25, 0.1, 0.1]} />
                <meshStandardMaterial color="#2d5a2d" />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Warm windows with shutters - reduced density: height/1.3 → height/2.6 */}
      {Array.from({ length: Math.floor(height / 2.6) }, (_, i) => {
        const y = 0.8 + i * 2.6;
        if (y > height - 0.5) return null;
        return (
          <group key={`win-${i}`}>
            {[-1, 1].map((side) => (
              <group key={`ws-${side}`} position={[side * width * 0.51, y, 0]}>
                {/* Window */}
                <mesh>
                  <planeGeometry args={[0.3, 0.4]} />
                  <meshStandardMaterial
                    color="#FFF8DC"
                    emissive="#FFD700"
                    emissiveIntensity={seededRange(seed + i * side * 5, 0.3, 1.5)}
                    transparent opacity={0.9}
                    side={THREE.DoubleSide}
                  />
                </mesh>
                {/* Shutters */}
                <mesh position={[-0.18, 0, 0.01]}>
                  <planeGeometry args={[0.05, 0.42]} />
                  <meshStandardMaterial color={secondaryColor} side={THREE.DoubleSide} />
                </mesh>
                <mesh position={[0.18, 0, 0.01]}>
                  <planeGeometry args={[0.05, 0.42]} />
                  <meshStandardMaterial color={secondaryColor} side={THREE.DoubleSide} />
                </mesh>
              </group>
            ))}
          </group>
        );
      })}

      {/* Front door */}
      <mesh position={[0, 0.5, depth * 0.51]}>
        <planeGeometry args={[0.35, 0.7]} />
        <meshStandardMaterial color="#5a3a1a" side={THREE.DoubleSide} />
      </mesh>
      {/* Door frame */}
      <mesh position={[0, 0.85, depth * 0.52]}>
        <planeGeometry args={[0.45, 0.05]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* Awning over entrance */}
      <mesh position={[0, 1, depth * 0.6]} rotation={[0.3, 0, 0]}>
        <planeGeometry args={[width * 0.5, 0.4]} />
        <meshStandardMaterial color={accentColor} side={THREE.DoubleSide} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

/* ── Gothic Cathedral (Classical) ── */
function GothicCathedral({ height, width, depth, primaryColor, secondaryColor, accentColor, seed }: {
  height: number; width: number; depth: number; primaryColor: string; secondaryColor: string; accentColor: string; seed: number;
}) {
  return (
    <group>
      {/* Nave */}
      <mesh position={[0, height * 0.4, 0]}>
        <boxGeometry args={[width * 0.7, height * 0.8, depth * 1.2]} />
        <meshPhysicalMaterial color={primaryColor} roughness={0.6} metalness={0.3} emissive={primaryColor} emissiveIntensity={0.05} />
      </mesh>

      {/* Transept */}
      <mesh position={[0, height * 0.35, 0]}>
        <boxGeometry args={[width * 1.3, height * 0.7, depth * 0.5]} />
        <meshPhysicalMaterial color={primaryColor} roughness={0.6} metalness={0.3} emissive={primaryColor} emissiveIntensity={0.05} />
      </mesh>

      {/* Main spire */}
      <mesh position={[0, height + 1.5, 0]}>
        <coneGeometry args={[width * 0.2, 3, 6]} />
        <meshPhysicalMaterial color={secondaryColor} roughness={0.3} metalness={0.7} emissive={accentColor} emissiveIntensity={0.1} />
      </mesh>

      {/* Side spires */}
      {[-1, 1].map((side) => (
        <group key={`spire-${side}`} position={[side * width * 0.55, 0, -depth * 0.5]}>
          <mesh position={[0, height * 0.45, 0]}>
            <boxGeometry args={[width * 0.25, height * 0.9, width * 0.25]} />
            <meshPhysicalMaterial color={secondaryColor} roughness={0.6} metalness={0.4} emissive={primaryColor} emissiveIntensity={0.05} />
          </mesh>
          <mesh position={[0, height * 0.9 + 1, 0]}>
            <coneGeometry args={[width * 0.15, 2, 6]} />
            <meshPhysicalMaterial color={secondaryColor} roughness={0.3} metalness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Rose window (front) - reduced segments: 16 → 8 */}
      <mesh position={[0, height * 0.6, depth * 0.61]}>
        <circleGeometry args={[Math.min(width, depth) * 0.3, 8]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={1.5}
          transparent opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Rose window ring - reduced segments: 16 → 8 */}
      <mesh position={[0, height * 0.6, depth * 0.615]} rotation={[0, 0, 0]}>
        <ringGeometry args={[Math.min(width, depth) * 0.28, Math.min(width, depth) * 0.33, 8]} />
        <meshStandardMaterial color={secondaryColor} side={THREE.DoubleSide} />
      </mesh>

      {/* Flying buttresses */}
      {[-1, 1].map((side) =>
        [0.2, 0.5, 0.8].map((t) => (
          <mesh
            key={`buttress-${side}-${t}`}
            position={[side * width * 0.6, height * t * 0.5, -depth * 0.1 + t * depth * 0.3]}
            rotation={[0, 0, side * 0.3]}
          >
            <boxGeometry args={[0.06, height * 0.2, 0.06]} />
            <meshPhysicalMaterial color={secondaryColor} roughness={0.7} metalness={0.3} />
          </mesh>
        ))
      )}

      {/* Gothic pointed arch windows */}
      {Array.from({ length: Math.floor(height / 2) }, (_, i) => {
        const y = 1 + i * 2;
        if (y > height * 0.7) return null;
        return (
          <group key={`gothic-win-${i}`}>
            {/* Side windows on nave */}
            {[-1, 1].map((side) => (
              <group key={`gw-${side}`} position={[side * width * 0.36, y, depth * 0.61]}>
                <mesh>
                  <planeGeometry args={[0.25, 0.5]} />
                  <meshStandardMaterial
                    color="#ffffff"
                    emissive={accentColor}
                    emissiveIntensity={seededRange(seed + i * side * 3, 0.5, 2.0)}
                    transparent opacity={0.9}
                    side={THREE.DoubleSide}
                  />
                </mesh>
                {/* Pointed arch */}
                <mesh position={[0, 0.3, 0]}>
                  <circleGeometry args={[0.13, 8, 0, Math.PI]} />
                  <meshStandardMaterial
                    color="#ffffff"
                    emissive={accentColor}
                    emissiveIntensity={seededRange(seed + i * side * 3, 0.5, 2.0)}
                    transparent opacity={0.9}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              </group>
            ))}
          </group>
        );
      })}

      {/* Cross on top */}
      <group position={[0, height + 3.1, 0]}>
        <mesh>
          <boxGeometry args={[0.04, 0.4, 0.04]} />
          <meshPhysicalMaterial color={accentColor} metalness={0.9} roughness={0.1} emissive={accentColor} emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.25, 0.04, 0.04]} />
          <meshPhysicalMaterial color={accentColor} metalness={0.9} roughness={0.1} emissive={accentColor} emissiveIntensity={0.5} />
        </mesh>
      </group>
    </group>
  );
}

/* ── Modern Minimalist (Default) ── */
function ModernBuilding({ height, width, depth, primaryColor, secondaryColor, accentColor, seed }: {
  height: number; width: number; depth: number; primaryColor: string; secondaryColor: string; accentColor: string; seed: number;
}) {
  return (
    <group>
      {/* Clean box with slight twist */}
      <mesh position={[0, height * 0.5, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshPhysicalMaterial
          color={primaryColor}
          roughness={0.15}
          metalness={0.6}
          emissive={primaryColor}
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Accent stripe */}
      <mesh position={[0, height * 0.5, depth * 0.51]}>
        <planeGeometry args={[0.08, height * 0.8]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.8} side={THREE.DoubleSide} />
      </mesh>

      {/* Cantilevered top section */}
      <mesh position={[width * 0.1, height - 0.5, 0]}>
        <boxGeometry args={[width * 1.15, 1, depth * 0.9]} />
        <meshPhysicalMaterial color={secondaryColor} roughness={0.1} metalness={0.7} emissive={accentColor} emissiveIntensity={0.15} />
      </mesh>

      {/* Window grid - reduced density: height/1.0 → height/2.0 */}
      {Array.from({ length: Math.floor(height / 2.0) }, (_, i) => {
        const y = 0.6 + i * 2.0;
        if (y > height - 1) return null;
        const cols = Math.max(2, Math.floor(width / 0.45));
        return (
          <group key={`row-${i}`}>
            {Array.from({ length: cols }, (_, c) => {
              const x = -width * 0.4 + c * (width * 0.8 / Math.max(1, cols - 1));
              return (
                <mesh key={`w-${c}`} position={[x, y, depth * 0.51]}>
                  <planeGeometry args={[0.2, 0.3]} />
                  <meshStandardMaterial
                    color="#ffffff"
                    emissive={accentColor}
                    emissiveIntensity={seededRange(seed + i * 7 + c * 11, 0.2, 1.8)}
                    transparent opacity={0.85}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              );
            })}
          </group>
        );
      })}

      {/* Flat roof with equipment */}
      <mesh position={[width * 0.2, height + 0.15, -depth * 0.2]}>
        <boxGeometry args={[0.4, 0.3, 0.3]} />
        <meshPhysicalMaterial color="#444" roughness={0.5} metalness={0.6} />
      </mesh>
    </group>
  );
}

/* ── Cathedral Variant 1: Dome Conservatory (Jazz/Classical) ── */
function DomeConservatory({ height, width, depth, primaryColor, secondaryColor, accentColor, seed }: {
  height: number; width: number; depth: number; primaryColor: string; secondaryColor: string; accentColor: string; seed: number;
}) {
  return (
    <group>
      {/* Wide base */}
      <mesh position={[0, height * 0.4, 0]}>
        <boxGeometry args={[width * 1.2, height * 0.8, depth * 1.2]} />
        <meshPhysicalMaterial color={primaryColor} roughness={0.5} metalness={0.4} emissive={primaryColor} emissiveIntensity={0.07} />
      </mesh>
      {/* Dome on top */}
      <mesh position={[0, height * 0.85, 0]}>
        <sphereGeometry args={[width * 0.55, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color={secondaryColor} roughness={0.2} metalness={0.6} emissive={accentColor} emissiveIntensity={0.15} />
      </mesh>
      {/* Small columns around base */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh key={`col-${i}`} position={[Math.cos(angle) * width * 0.55, height * 0.4, Math.sin(angle) * depth * 0.55]}>
            <cylinderGeometry args={[0.07, 0.09, height * 0.8, 6]} />
            <meshPhysicalMaterial color={accentColor} roughness={0.3} metalness={0.5} />
          </mesh>
        );
      })}
      {/* Windows on base */}
      {Array.from({ length: Math.floor(height / 2.5) }, (_, i) => {
        const y = 1 + i * 2.5;
        if (y > height * 0.7) return null;
        return (
          <mesh key={`win-${i}`} position={[0, y, depth * 0.61]}>
            <planeGeometry args={[0.3, 0.5]} />
            <meshStandardMaterial color="#ffffff" emissive={accentColor} emissiveIntensity={seededRange(seed + i * 7, 0.4, 1.8)} transparent opacity={0.9} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ── Cathedral Variant 2: Bell Tower (Jazz/Classical) ── */
function BellTower({ height, width, depth, primaryColor, secondaryColor, accentColor, seed }: {
  height: number; width: number; depth: number; primaryColor: string; secondaryColor: string; accentColor: string; seed: number;
}) {
  return (
    <group>
      {/* Main narrow tower */}
      <mesh position={[0, height * 0.5, 0]}>
        <boxGeometry args={[width * 0.7, height, depth * 0.7]} />
        <meshPhysicalMaterial color={primaryColor} roughness={0.55} metalness={0.35} emissive={primaryColor} emissiveIntensity={0.06} />
      </mesh>
      {/* Open arched belfry section */}
      <mesh position={[0, height * 0.82, 0]}>
        <boxGeometry args={[width * 0.75, height * 0.18, depth * 0.75]} />
        <meshPhysicalMaterial color={secondaryColor} roughness={0.4} metalness={0.5} emissive={accentColor} emissiveIntensity={0.1} />
      </mesh>
      {/* Arched openings on belfry */}
      {[-1, 1].map((side) => (
        <mesh key={`arch-${side}`} position={[side * width * 0.36, height * 0.82, 0]}>
          <planeGeometry args={[0.3, height * 0.15]} />
          <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.6} transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Cone roof */}
      <mesh position={[0, height + 0.7, 0]}>
        <coneGeometry args={[width * 0.4, 1.4, 6]} />
        <meshPhysicalMaterial color={secondaryColor} roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Swaying bell */}
      <group position={[0, height * 0.85, 0]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.2, 0.2, 8, 1, true]} />
          <meshPhysicalMaterial color={accentColor} roughness={0.2} metalness={0.9} emissive={accentColor} emissiveIntensity={0.2} />
        </mesh>
      </group>
      {/* Windows */}
      {Array.from({ length: Math.floor(height / 2.5) }, (_, i) => {
        const y = 1 + i * 2.5;
        if (y > height * 0.75) return null;
        return (
          <mesh key={`win-${i}`} position={[width * 0.36, y, 0]}>
            <planeGeometry args={[0.25, 0.45]} />
            <meshStandardMaterial color="#ffffff" emissive={accentColor} emissiveIntensity={seededRange(seed + i * 11, 0.4, 1.6)} transparent opacity={0.85} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ── Neon-Tower Variant 1: Crystalline Shard (Electronic) ── */
function CrystallineShard({ height, width, depth, primaryColor, secondaryColor, accentColor, seed }: {
  height: number; width: number; depth: number; primaryColor: string; secondaryColor: string; accentColor: string; seed: number;
}) {
  return (
    <group>
      {/* Main tilted shard */}
      <mesh position={[0, height * 0.5, 0]} rotation={[0, 0, 0.27]}>
        <boxGeometry args={[width * 0.75, height, depth * 0.65]} />
        <meshPhysicalMaterial color={primaryColor} roughness={0.05} metalness={0.4} emissive={primaryColor} emissiveIntensity={0.3} transparent opacity={0.85} />
      </mesh>
      {/* Secondary shard offset */}
      <mesh position={[width * 0.2, height * 0.4, depth * 0.1]} rotation={[0.1, 0, -0.18]}>
        <boxGeometry args={[width * 0.4, height * 0.7, depth * 0.4]} />
        <meshPhysicalMaterial color={secondaryColor} roughness={0.05} metalness={0.5} emissive={accentColor} emissiveIntensity={0.4} transparent opacity={0.75} />
      </mesh>
      {/* Glowing core */}
      <mesh position={[0, height * 0.6, 0]}>
        <octahedronGeometry args={[width * 0.25, 0]} />
        <meshPhysicalMaterial color={accentColor} roughness={0.0} metalness={1.0} emissive={accentColor} emissiveIntensity={1.2} transparent opacity={0.9} />
      </mesh>
      {/* LED strips */}
      {[-1, 1].map((s) => (
        <mesh key={`strip-${s}`} position={[s * width * 0.36, height * 0.5, 0]}>
          <boxGeometry args={[0.04, height * 0.85, 0.04]} />
          <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={1.5} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Neon-Tower Variant 2: Floating Platform (Electronic) ── */
function FloatingPlatform({ height, width, depth, primaryColor, secondaryColor, accentColor, seed }: {
  height: number; width: number; depth: number; primaryColor: string; secondaryColor: string; accentColor: string; seed: number;
}) {
  const tiers = 4;
  return (
    <group>
      {/* Stack of thin platforms with gaps */}
      {Array.from({ length: tiers - 1 }, (_, i) => {
        const t = i / (tiers - 1);
        const y = (height * 0.7 / tiers) * i + height * 0.05;
        const scale = 1 - t * 0.2;
        return (
          <mesh key={`tier-${i}`} position={[0, y, 0]}>
            <cylinderGeometry args={[width * 0.5 * scale, width * 0.52 * scale, height * 0.12, 8]} />
            <meshPhysicalMaterial color={i % 2 === 0 ? primaryColor : secondaryColor} roughness={0.1} metalness={0.7} emissive={primaryColor} emissiveIntensity={0.2 + t * 0.2} />
          </mesh>
        );
      })}
      {/* Bobbing top tier */}
      <mesh position={[0, height * 0.88, 0]}>
        <cylinderGeometry args={[width * 0.35, width * 0.37, height * 0.14, 8]} />
        <meshPhysicalMaterial color={accentColor} roughness={0.05} metalness={0.8} emissive={accentColor} emissiveIntensity={0.6} />
      </mesh>
      {/* Central column */}
      <mesh position={[0, height * 0.45, 0]}>
        <cylinderGeometry args={[0.1, 0.12, height * 0.9, 6]} />
        <meshPhysicalMaterial color="#222222" roughness={0.2} metalness={0.9} emissive={accentColor} emissiveIntensity={0.3} />
      </mesh>
      {/* Emissive rings between tiers */}
      {[0.25, 0.5, 0.72].map((t, i) => (
        <mesh key={`ring-${i}`} position={[0, height * t, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[width * 0.55, 0.04, 4, 12]} />
          <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={1.2} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Fortress Variant 1: Brutalist Bunker (Rock) ── */
function BrutalistBunker({ height, width, depth, primaryColor, secondaryColor, accentColor, seed }: {
  height: number; width: number; depth: number; primaryColor: string; secondaryColor: string; accentColor: string; seed: number;
}) {
  return (
    <group>
      {/* Heavy low main body */}
      <mesh position={[0, height * 0.35, 0]}>
        <boxGeometry args={[width * 1.3, height * 0.7, depth * 1.3]} />
        <meshPhysicalMaterial color={primaryColor} roughness={0.9} metalness={0.1} emissive={primaryColor} emissiveIntensity={0.04} />
      </mesh>
      {/* Upper block - slightly smaller */}
      <mesh position={[width * 0.1, height * 0.8, depth * 0.05]}>
        <boxGeometry args={[width * 0.9, height * 0.3, depth * 0.85]} />
        <meshPhysicalMaterial color={secondaryColor} roughness={0.85} metalness={0.15} emissive={primaryColor} emissiveIntensity={0.05} />
      </mesh>
      {/* Concrete slab on top */}
      <mesh position={[0, height + 0.15, 0]}>
        <boxGeometry args={[width * 1.35, 0.3, depth * 1.35]} />
        <meshPhysicalMaterial color={secondaryColor} roughness={0.95} metalness={0.05} />
      </mesh>
      {/* Slit windows */}
      {Array.from({ length: Math.floor(height / 2.5) }, (_, i) => {
        const y = 1.2 + i * 2.5;
        if (y > height * 0.85) return null;
        return (
          <group key={`slit-${i}`}>
            {[-1, 1].map((side) => (
              <mesh key={`s-${side}`} position={[side * width * 0.66, y, 0]}>
                <planeGeometry args={[0.5, 0.15]} />
                <meshStandardMaterial color="#ffaa44" emissive="#ff8800" emissiveIntensity={seededRange(seed + i * side * 5, 0.2, 1.2)} transparent opacity={0.85} side={THREE.DoubleSide} />
              </mesh>
            ))}
          </group>
        );
      })}
      {/* Surface texture blocks */}
      {[0.2, 0.5, 0.75].map((t, i) => (
        <mesh key={`tex-${i}`} position={[0, height * t, depth * 0.66]}>
          <boxGeometry args={[width * 0.4, 0.08, 0.06]} />
          <meshPhysicalMaterial color={accentColor} roughness={0.9} metalness={0.1} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Fortress Variant 2: Smokestack Factory (Rock) ── */
function SmokestackFactory({ height, width, depth, primaryColor, secondaryColor, accentColor, seed }: {
  height: number; width: number; depth: number; primaryColor: string; secondaryColor: string; accentColor: string; seed: number;
}) {
  return (
    <group>
      {/* Box base factory */}
      <mesh position={[0, height * 0.45, 0]}>
        <boxGeometry args={[width * 1.1, height * 0.9, depth * 1.1]} />
        <meshPhysicalMaterial color={primaryColor} roughness={0.7} metalness={0.5} emissive={primaryColor} emissiveIntensity={0.06} />
      </mesh>
      {/* Smokestacks */}
      {[[-width * 0.25, height, depth * 0.1], [width * 0.15, height + 0.3, -depth * 0.15], [width * 0.35, height - 0.2, depth * 0.25]].map(([sx, sy, sz], i) => (
        <group key={`stack-${i}`}>
          <mesh position={[sx, sy + (height * 0.25 + i * 0.15) * 0.5, sz]}>
            <cylinderGeometry args={[0.1 - i * 0.02, 0.14 - i * 0.02, height * 0.25 + i * 0.15, 8]} />
            <meshPhysicalMaterial color="#333333" roughness={0.5} metalness={0.8} />
          </mesh>
          {/* Stack top ring */}
          <mesh position={[sx, sy + height * 0.25 + i * 0.15, sz]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.14 - i * 0.02, 0.025, 4, 8]} />
            <meshPhysicalMaterial color="#555555" roughness={0.4} metalness={0.9} />
          </mesh>
        </group>
      ))}
      {/* Industrial windows */}
      {Array.from({ length: Math.floor(height / 2.5) }, (_, i) => {
        const y = 1.5 + i * 2.5;
        if (y > height * 0.8) return null;
        return (
          <mesh key={`win-${i}`} position={[0, y, depth * 0.56]}>
            <planeGeometry args={[0.5, 0.3]} />
            <meshStandardMaterial color="#ffaa44" emissive="#ff8800" emissiveIntensity={seededRange(seed + i * 9, 0.3, 1.4)} transparent opacity={0.85} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
      {/* Warning light */}
      <mesh position={[0, height + 0.5, 0]}>
        <sphereGeometry args={[0.12, 6, 6]} />
        <meshStandardMaterial color="#ff3333" emissive="#ff3333" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

/* ── Penthouse Variant 1: Water Tower Building (Hip-Hop) ── */
function WaterTowerBuilding({ height, width, depth, primaryColor, secondaryColor, accentColor, seed }: {
  height: number; width: number; depth: number; primaryColor: string; secondaryColor: string; accentColor: string; seed: number;
}) {
  return (
    <group>
      {/* Main box base - half height-ish */}
      <mesh position={[0, height * 0.4, 0]}>
        <boxGeometry args={[width, height * 0.8, depth]} />
        <meshPhysicalMaterial color={primaryColor} roughness={0.55} metalness={0.35} emissive={primaryColor} emissiveIntensity={0.08} />
      </mesh>
      {/* Water tower structure on top */}
      <group position={[width * 0.15, height * 0.85, -depth * 0.1]}>
        {/* Legs */}
        {[[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].map(([lx, lz], i) => (
          <mesh key={`leg-${i}`} position={[lx, 0.4, lz]}>
            <boxGeometry args={[0.05, 0.8, 0.05]} />
            <meshPhysicalMaterial color="#555" roughness={0.5} metalness={0.75} />
          </mesh>
        ))}
        {/* Tank cylinder */}
        <mesh position={[0, 1.05, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.65, 10]} />
          <meshPhysicalMaterial color="#3a3a3a" roughness={0.6} metalness={0.55} />
        </mesh>
        {/* Tank cone cap */}
        <mesh position={[0, 1.42, 0]}>
          <coneGeometry args={[0.32, 0.2, 10]} />
          <meshPhysicalMaterial color="#2a2a2a" roughness={0.65} metalness={0.5} />
        </mesh>
      </group>
      {/* Graffiti panels */}
      {Array.from({ length: Math.floor(height / 2.2) }, (_, i) => {
        const y = 0.8 + i * 2.2;
        if (y > height * 0.75) return null;
        const colors = ['#FF1493', '#FFD700', '#00FF7F', '#FF4500'];
        const color = colors[Math.floor(seededRandom(seed + i * 23) * colors.length)];
        return (
          <mesh key={`g-${i}`} position={[(seededRandom(seed + i) - 0.5) * width * 0.6, y, depth * 0.51]}>
            <planeGeometry args={[seededRange(seed + i * 7, 0.25, 0.65), seededRange(seed + i * 13, 0.3, 0.7)]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.9} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
      {/* Windows */}
      {Array.from({ length: Math.floor(height / 1.8) }, (_, i) => {
        const y = 0.8 + i * 1.8;
        if (y > height * 0.75) return null;
        return (
          <mesh key={`win-${i}`} position={[-(width * 0.3), y, depth * 0.52]}>
            <planeGeometry args={[0.25, 0.3]} />
            <meshStandardMaterial color="#ffffff" emissive={accentColor} emissiveIntensity={seededRange(seed + i * 5, 0.2, 1.6)} transparent opacity={0.85} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ── Penthouse Variant 2: Billboard Building (Hip-Hop) ── */
function BillboardBuilding({ height, width, depth, primaryColor, secondaryColor, accentColor, seed }: {
  height: number; width: number; depth: number; primaryColor: string; secondaryColor: string; accentColor: string; seed: number;
}) {
  return (
    <group>
      {/* Main box */}
      <mesh position={[0, height * 0.45, 0]}>
        <boxGeometry args={[width, height * 0.9, depth]} />
        <meshPhysicalMaterial color={primaryColor} roughness={0.5} metalness={0.4} emissive={primaryColor} emissiveIntensity={0.08} />
      </mesh>
      {/* Billboard frame posts */}
      {[-width * 0.3, width * 0.3].map((x, i) => (
        <mesh key={`post-${i}`} position={[x, height + 0.7, 0]}>
          <boxGeometry args={[0.06, 1.4, 0.06]} />
          <meshPhysicalMaterial color="#555" roughness={0.4} metalness={0.8} />
        </mesh>
      ))}
      {/* Billboard panel */}
      <mesh position={[0, height + 1.3, 0]}>
        <boxGeometry args={[width * 0.75, 0.55, 0.05]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.8} />
      </mesh>
      {/* Graffiti panels */}
      {Array.from({ length: Math.floor(height / 2) }, (_, i) => {
        const y = 0.7 + i * 2;
        if (y > height * 0.85) return null;
        const colors = ['#FF1493', '#FFD700', '#00FF7F', '#7B68EE'];
        const color = colors[Math.floor(seededRandom(seed + i * 41) * colors.length)];
        const side = seededRandom(seed + i * 67) > 0.5 ? 1 : -1;
        return (
          <mesh key={`gr-${i}`} position={[side * width * 0.51, y, seededRange(seed + i, -depth * 0.3, depth * 0.3)]}>
            <planeGeometry args={[seededRange(seed + i * 11, 0.2, 0.6), seededRange(seed + i * 17, 0.3, 0.65)]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} transparent opacity={0.9} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
      {/* Windows */}
      {Array.from({ length: Math.floor(height / 1.5) }, (_, i) => {
        const y = 0.8 + i * 1.5;
        if (y > height * 0.85) return null;
        return (
          <mesh key={`win-${i}`} position={[0, y, depth * 0.52]}>
            <planeGeometry args={[0.22, 0.3]} />
            <meshStandardMaterial color="#ffffff" emissive={accentColor} emissiveIntensity={seededRange(seed + i * 3, 0.2, 1.8)} transparent opacity={0.85} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ── Skyscraper Variant 1: Bubbly Dome (Pop) ── */
function BubblyDome({ height, width, depth, primaryColor, secondaryColor, accentColor, seed }: {
  height: number; width: number; depth: number; primaryColor: string; secondaryColor: string; accentColor: string; seed: number;
}) {
  return (
    <group>
      {/* Cylinder base */}
      <mesh position={[0, height * 0.45, 0]}>
        <cylinderGeometry args={[width * 0.48, width * 0.52, height * 0.9, 10]} />
        <meshPhysicalMaterial color={primaryColor} roughness={0.1} metalness={0.6} emissive={primaryColor} emissiveIntensity={0.12} transparent opacity={0.92} />
      </mesh>
      {/* Central dome sphere */}
      <mesh position={[0, height + 0.3, 0]}>
        <sphereGeometry args={[width * 0.42, 8, 6]} />
        <meshPhysicalMaterial color={accentColor} roughness={0.05} metalness={0.5} emissive={accentColor} emissiveIntensity={0.25} transparent opacity={0.88} />
      </mesh>
      {/* Clustered small spheres */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        const r = width * 0.35;
        return (
          <mesh key={`bubble-${i}`} position={[Math.cos(angle) * r, height + 0.25 + seededRange(seed + i * 19, 0, 0.3), Math.sin(angle) * r]}>
            <sphereGeometry args={[seededRange(seed + i * 37, 0.1, 0.22), 6, 5]} />
            <meshPhysicalMaterial color={i % 2 === 0 ? secondaryColor : accentColor} roughness={0.05} metalness={0.4} emissive={accentColor} emissiveIntensity={0.3} transparent opacity={0.85} />
          </mesh>
        );
      })}
      {/* Windows on cylinder */}
      {Array.from({ length: Math.floor(height / 1.8) }, (_, i) => {
        const y = 0.5 + i * 1.8;
        if (y > height - 0.5) return null;
        const angle = (i * 0.8) + seed;
        return (
          <mesh key={`win-${i}`} position={[Math.cos(angle) * width * 0.5, y, Math.sin(angle) * width * 0.5]} rotation={[0, -angle + Math.PI / 2, 0]}>
            <planeGeometry args={[0.22, 0.3]} />
            <meshStandardMaterial color="#ffffff" emissive={primaryColor} emissiveIntensity={seededRange(seed + i * 11, 0.3, 2.0)} transparent opacity={0.9} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ── Skyscraper Variant 2: Neon Marquee (Pop) ── */
function NeonMarquee({ height, width, depth, primaryColor, secondaryColor, accentColor, seed }: {
  height: number; width: number; depth: number; primaryColor: string; secondaryColor: string; accentColor: string; seed: number;
}) {
  const segments = Math.max(4, Math.floor(height / 2));
  return (
    <group>
      {/* Main box building */}
      {Array.from({ length: segments }, (_, i) => {
        const t = i / segments;
        const segH = height / segments;
        const colors = [primaryColor, accentColor, secondaryColor];
        return (
          <mesh key={`seg-${i}`} position={[0, segH * (i + 0.5), 0]}>
            <boxGeometry args={[width * (1 - t * 0.12), segH - 0.04, depth * (1 - t * 0.12)]} />
            <meshPhysicalMaterial color={colors[i % 3]} roughness={0.08} metalness={0.7} emissive={colors[i % 3]} emissiveIntensity={0.15 + t * 0.2} transparent opacity={0.92} />
          </mesh>
        );
      })}
      {/* Rotating ring around middle */}
      <mesh position={[0, height * 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[Math.max(width, depth) * 0.72, 0.07, 4, 14]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={1.5} />
      </mesh>
      {/* Antenna */}
      <mesh position={[0, height + 1.2, 0]}>
        <cylinderGeometry args={[0.03, 0.05, 2.4, 5]} />
        <meshStandardMaterial color="#cccccc" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Windows */}
      {Array.from({ length: Math.floor(height / 1.8) }, (_, i) => {
        const y = 0.5 + i * 1.8;
        if (y > height - 0.5) return null;
        const cols = Math.max(2, Math.floor(width / 0.5));
        return (
          <group key={`row-${i}`}>
            {Array.from({ length: cols }, (_, c) => {
              const x = -width * 0.38 + c * (width * 0.76 / Math.max(1, cols - 1));
              return (
                <mesh key={`w-${c}`} position={[x, y, depth * 0.51]}>
                  <planeGeometry args={[0.2, 0.28]} />
                  <meshStandardMaterial color="#ffffff" emissive={primaryColor} emissiveIntensity={seededRange(seed + i * 7 + c * 13, 0.2, 2.0)} transparent opacity={0.85} side={THREE.DoubleSide} />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </group>
  );
}

/* ── Brownstone Variant 1: Bookshop Row (Indie) ── */
function BookshopRow({ height, width, depth, primaryColor, secondaryColor, accentColor, seed }: {
  height: number; width: number; depth: number; primaryColor: string; secondaryColor: string; accentColor: string; seed: number;
}) {
  const shopCount = 3;
  const shopColors = [primaryColor, secondaryColor, accentColor];
  return (
    <group>
      {Array.from({ length: shopCount }, (_, i) => {
        const t = i / shopCount;
        const shopW = width / shopCount;
        const shopH = height * (0.75 + seededRandom(seed + i * 17) * 0.35);
        const x = -width * 0.33 + i * (width / shopCount) + shopW * 0.5 - width / 2 + shopW / 2;
        return (
          <group key={`shop-${i}`} position={[x, 0, 0]}>
            {/* Shop body */}
            <mesh position={[0, shopH * 0.5, 0]}>
              <boxGeometry args={[shopW * 0.92, shopH, depth]} />
              <meshPhysicalMaterial color={shopColors[i]} roughness={0.7} metalness={0.2} emissive={shopColors[i]} emissiveIntensity={0.05} />
            </mesh>
            {/* Pitched mini roof */}
            <mesh position={[0, shopH + 0.2, 0]}>
              <coneGeometry args={[shopW * 0.56, 0.5, 4]} />
              <meshPhysicalMaterial color={i % 2 === 0 ? secondaryColor : primaryColor} roughness={0.85} metalness={0.1} />
            </mesh>
            {/* Shop window */}
            <mesh position={[0, shopH * 0.3, depth * 0.51]}>
              <planeGeometry args={[shopW * 0.65, shopH * 0.32]} />
              <meshStandardMaterial color="#FFF8DC" emissive="#FFD700" emissiveIntensity={seededRange(seed + i * 29, 0.3, 1.3)} transparent opacity={0.88} side={THREE.DoubleSide} />
            </mesh>
            {/* Sign above window */}
            <mesh position={[0, shopH * 0.52, depth * 0.52]}>
              <planeGeometry args={[shopW * 0.6, shopH * 0.06]} />
              <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.5} transparent opacity={0.9} side={THREE.DoubleSide} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* ── Brownstone Variant 2: Greenhouse Rooftop (Indie) ── */
function GreenhouseRooftop({ height, width, depth, primaryColor, secondaryColor, accentColor, seed }: {
  height: number; width: number; depth: number; primaryColor: string; secondaryColor: string; accentColor: string; seed: number;
}) {
  return (
    <group>
      {/* Main brownstone body */}
      <mesh position={[0, height * 0.5, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshPhysicalMaterial color={primaryColor} roughness={0.7} metalness={0.2} emissive={primaryColor} emissiveIntensity={0.05} />
      </mesh>
      {/* Greenhouse box on rooftop */}
      <mesh position={[0, height + 0.45, 0]}>
        <boxGeometry args={[width * 0.7, 0.9, depth * 0.65]} />
        <meshPhysicalMaterial color="#88ffaa" roughness={0.05} metalness={0.1} transmission={0.7} transparent opacity={0.45} emissive="#33ff77" emissiveIntensity={0.15} />
      </mesh>
      {/* Greenhouse frame */}
      {[-1, 1].map((s) => (
        <mesh key={`frame-${s}`} position={[s * width * 0.35, height + 0.45, 0]}>
          <boxGeometry args={[0.04, 0.9, depth * 0.65]} />
          <meshStandardMaterial color="#448844" roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
      {/* Balconies */}
      {Array.from({ length: Math.min(3, Math.floor(height / 3)) }, (_, i) => {
        const y = 2 + i * 3;
        if (y > height - 1) return null;
        return (
          <mesh key={`bal-${i}`} position={[0, y, depth * 0.62]}>
            <boxGeometry args={[width * 0.5, 0.06, 0.4]} />
            <meshPhysicalMaterial color="#555" roughness={0.5} metalness={0.6} />
          </mesh>
        );
      })}
      {/* Warm windows */}
      {Array.from({ length: Math.floor(height / 2.5) }, (_, i) => {
        const y = 0.8 + i * 2.5;
        if (y > height - 0.5) return null;
        return (
          <group key={`win-${i}`}>
            {[-1, 1].map((side) => (
              <mesh key={`w-${side}`} position={[side * width * 0.51, y, 0]}>
                <planeGeometry args={[0.28, 0.38]} />
                <meshStandardMaterial color="#FFF8DC" emissive="#FFD700" emissiveIntensity={seededRange(seed + i * side * 5, 0.3, 1.5)} transparent opacity={0.9} side={THREE.DoubleSide} />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}

/* ── Modern Variant 1: Cylinder Tower (Default) ── */
function ModernVariantA({ height, width, depth, primaryColor, secondaryColor, accentColor, seed }: {
  height: number; width: number; depth: number; primaryColor: string; secondaryColor: string; accentColor: string; seed: number;
}) {
  return (
    <group>
      {/* Main cylinder */}
      <mesh position={[0, height * 0.5, 0]}>
        <cylinderGeometry args={[width * 0.45, width * 0.5, height, 10]} />
        <meshPhysicalMaterial color={primaryColor} roughness={0.15} metalness={0.65} emissive={primaryColor} emissiveIntensity={0.1} />
      </mesh>
      {/* Cantilevered cap */}
      <mesh position={[width * 0.08, height - 0.4, 0]}>
        <cylinderGeometry args={[width * 0.56, width * 0.52, 0.8, 10]} />
        <meshPhysicalMaterial color={secondaryColor} roughness={0.1} metalness={0.75} emissive={accentColor} emissiveIntensity={0.18} />
      </mesh>
      {/* Accent stripe */}
      <mesh position={[0, height * 0.5, width * 0.46]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.07, height * 0.85]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* Windows */}
      {Array.from({ length: Math.floor(height / 2.0) }, (_, i) => {
        const y = 0.6 + i * 2.0;
        if (y > height - 1) return null;
        const angle = (i * 1.2) + seed;
        return (
          <mesh key={`win-${i}`} position={[Math.cos(angle) * width * 0.47, y, Math.sin(angle) * width * 0.47]} rotation={[0, -angle + Math.PI / 2, 0]}>
            <planeGeometry args={[0.2, 0.28]} />
            <meshStandardMaterial color="#ffffff" emissive={accentColor} emissiveIntensity={seededRange(seed + i * 7, 0.2, 1.8)} transparent opacity={0.85} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ── Modern Variant 2: L-Shaped Building (Default) ── */
function ModernVariantB({ height, width, depth, primaryColor, secondaryColor, accentColor, seed }: {
  height: number; width: number; depth: number; primaryColor: string; secondaryColor: string; accentColor: string; seed: number;
}) {
  return (
    <group>
      {/* Main wing */}
      <mesh position={[0, height * 0.5, 0]}>
        <boxGeometry args={[width, height, depth * 0.6]} />
        <meshPhysicalMaterial color={primaryColor} roughness={0.15} metalness={0.6} emissive={primaryColor} emissiveIntensity={0.1} />
      </mesh>
      {/* L-arm wing */}
      <mesh position={[width * 0.35, height * 0.35, depth * 0.45]}>
        <boxGeometry args={[width * 0.4, height * 0.7, depth * 0.55]} />
        <meshPhysicalMaterial color={secondaryColor} roughness={0.12} metalness={0.65} emissive={accentColor} emissiveIntensity={0.12} />
      </mesh>
      {/* Connecting bridge slab */}
      <mesh position={[width * 0.35, height * 0.72, depth * 0.15]}>
        <boxGeometry args={[width * 0.42, 0.18, depth * 0.35]} />
        <meshPhysicalMaterial color={accentColor} roughness={0.1} metalness={0.75} emissive={accentColor} emissiveIntensity={0.2} />
      </mesh>
      {/* Accent stripe on main */}
      <mesh position={[0, height * 0.5, depth * 0.31]}>
        <planeGeometry args={[0.07, height * 0.85]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Window grid on main wing */}
      {Array.from({ length: Math.floor(height / 2.0) }, (_, i) => {
        const y = 0.6 + i * 2.0;
        if (y > height - 1) return null;
        const cols = Math.max(2, Math.floor(width / 0.5));
        return (
          <group key={`row-${i}`}>
            {Array.from({ length: cols }, (_, c) => {
              const x = -width * 0.38 + c * (width * 0.76 / Math.max(1, cols - 1));
              return (
                <mesh key={`w-${c}`} position={[x, y, depth * 0.31]}>
                  <planeGeometry args={[0.2, 0.3]} />
                  <meshStandardMaterial color="#ffffff" emissive={accentColor} emissiveIntensity={seededRange(seed + i * 7 + c * 11, 0.2, 1.8)} transparent opacity={0.85} side={THREE.DoubleSide} />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </group>
  );
}

/* ── Main Building Component ── */
function elasticOut(t: number): number {
  return Math.sin(-13 * (t + 1) * Math.PI / 2) * Math.pow(2, -10 * t) + 1;
}

const LOD_DISTANCE = 150;

function Building({ params, onClick, constructionDelay = 0, constructionElapsedRef, cameraPosition }: BuildingProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [isDistant, setIsDistant] = useState(false);
  const { height, width, depth, primaryColor, secondaryColor, accentColor, windowGlow, style, position, profile, isCurrentUser, dimmed, highlighted } = params;

  const seed = position[0] * 73 + position[2] * 137;
  const opacityRef = useRef(1);

  // Optimization 5: Memoize color computations
  const effectivePrimary = useMemo(() =>
    isCurrentUser
      ? '#' + new THREE.Color(primaryColor).lerp(new THREE.Color('#1DB954'), 0.25).getHexString()
      : primaryColor,
    [isCurrentUser, primaryColor]
  );
  const effectiveAccent = useMemo(() =>
    isCurrentUser
      ? '#' + new THREE.Color(accentColor).lerp(new THREE.Color('#1DB954'), 0.3).getHexString()
      : accentColor,
    [isCurrentUser, accentColor]
  );

  // Optimization 1a: Reuse Vector3 for scale lerp instead of allocating per frame
  const targetScaleVec = useRef(new THREE.Vector3(1, 1, 1));

  // Optimization 1b: Cache mesh references to avoid .traverse() every frame
  const meshesRef = useRef<THREE.Mesh[]>([]);
  const meshesCached = useRef(false);

  useEffect(() => {
    // Reset cache when building changes so it re-collects on next frame
    meshesCached.current = false;
    meshesRef.current = [];
  }, [style, height, width, depth, effectivePrimary, secondaryColor, effectiveAccent, seed, isCurrentUser]);

  const isIdleRef = useRef(false);
  const constructionDoneRef = useRef(!constructionElapsedRef);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Construction animation
    if (constructionElapsedRef && !constructionDoneRef.current) {
      const elapsed = constructionElapsedRef.current;
      const DURATION = 600;
      if (elapsed < constructionDelay) {
        groupRef.current.scale.y = 0.001;
        groupRef.current.position.y = -height * 0.5;
        return;
      }
      const progress = Math.min((elapsed - constructionDelay) / DURATION, 1);
      const scaleY = elasticOut(progress);
      groupRef.current.scale.y = scaleY;
      groupRef.current.position.y = (scaleY - 1) * height * 0.5;
      if (progress >= 1) {
        constructionDoneRef.current = true;
        groupRef.current.scale.y = 1;
        groupRef.current.position.y = 0;
      }
      return;
    }

    // LOD: check distance to camera every frame (cheap vector math)
    if (cameraPosition) {
      const cp = cameraPosition.current;
      const dx = cp.x - position[0];
      const dz = cp.z - position[2];
      const distSq = dx * dx + dz * dz;
      const shouldBeDistant = distSq > LOD_DISTANCE * LOD_DISTANCE;
      if (shouldBeDistant !== isDistant) setIsDistant(shouldBeDistant);
    }

    // Frame-skipping: if building is idle (not hovered, not highlighted, not dimming, scale ~1), skip
    const opacitySettled = Math.abs(opacityRef.current - (dimmed ? 0.15 : 1)) < 0.01;
    const scaleSettled = Math.abs(groupRef.current.scale.x - 1) < 0.005;
    if (!hovered && !highlighted && opacitySettled && scaleSettled) {
      if (isIdleRef.current) return; // already idle, skip frame
      isIdleRef.current = true;
    } else {
      isIdleRef.current = false;
    }

    const pulseScale = highlighted ? Math.sin(t * 3) * 0.03 : 0;
    const targetScale = hovered ? 1.04 : 1 + pulseScale;
    targetScaleVec.current.set(targetScale, targetScale, targetScale);
    groupRef.current.scale.lerp(targetScaleVec.current, 0.08);

    groupRef.current.position.y = Math.sin(t * 0.4 + position[0] * 0.3) * 0.06;

    const targetOpacity = dimmed ? 0.15 : 1;
    opacityRef.current += (targetOpacity - opacityRef.current) * 0.06;

    // Only update mesh opacity when actively transitioning
    if (!opacitySettled) {
      // Collect meshes once, then iterate the cached array
      if (!meshesCached.current) {
        meshesRef.current = [];
        groupRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            meshesRef.current.push(child);
          }
        });
        meshesCached.current = true;
      }

      const meshes = meshesRef.current;
      for (let i = 0, len = meshes.length; i < len; i++) {
        const mat = meshes[i].material as THREE.Material & { opacity: number };
        if (mat.opacity !== undefined) {
          if (!mat.userData.baseOpacity) mat.userData.baseOpacity = mat.opacity;
          mat.transparent = true;
          mat.opacity = Math.min(mat.userData.baseOpacity, opacityRef.current);
        }
      }
    }
  });

  const buildingComponent = useMemo(() => {
    const props = { height, width, depth, primaryColor: effectivePrimary, secondaryColor, accentColor: effectiveAccent, seed };
    const v = params.variant ?? 0;
    switch (style) {
      case 'cathedral':
        if (v === 1) return <DomeConservatory {...props} />;
        if (v === 2) return <BellTower {...props} />;
        // variant 0: jazz → art deco, classical → gothic
        if (profile.topGenres.some(g => g.toLowerCase().includes('jazz') || g.toLowerCase().includes('blues'))) {
          return <ArtDecoBuilding {...props} />;
        }
        return <GothicCathedral {...props} />;
      case 'neon-tower':
        if (v === 1) return <CrystallineShard {...props} />;
        if (v === 2) return <FloatingPlatform {...props} />;
        return <FuturisticTower {...props} />;
      case 'fortress':
        if (v === 1) return <BrutalistBunker {...props} />;
        if (v === 2) return <SmokestackFactory {...props} />;
        return <IndustrialFortress {...props} />;
      case 'penthouse':
        if (v === 1) return <WaterTowerBuilding {...props} />;
        if (v === 2) return <BillboardBuilding {...props} />;
        return <GraffitiTower {...props} />;
      case 'skyscraper':
        if (v === 1) return <BubblyDome {...props} />;
        if (v === 2) return <NeonMarquee {...props} />;
        return <PopTower {...props} />;
      case 'brownstone':
        if (v === 1) return <BookshopRow {...props} />;
        if (v === 2) return <GreenhouseRooftop {...props} />;
        return <BrownstoneBuild {...props} />;
      default:
        if (v === 1) return <ModernVariantA {...props} />;
        if (v === 2) return <ModernVariantB {...props} />;
        return <ModernBuilding {...props} />;
    }
  }, [height, width, depth, effectivePrimary, secondaryColor, effectiveAccent, seed, style, profile.topGenres, params.variant]);

  return (
    <group
      ref={groupRef}
      position={[position[0], 0, position[2]]}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      onClick={(e) => { e.stopPropagation(); onClick(params); }}
    >
      {/* LOD: distant buildings render as a simple colored box */}
      {isDistant ? (
        <mesh position={[0, height * 0.5, 0]}>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color={effectivePrimary} emissive={effectivePrimary} emissiveIntensity={0.15} />
        </mesh>
      ) : (
        <>
          {/* Ground glow - reduced segments: 12 → 8 */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <circleGeometry args={[Math.max(width, depth) * 1.2, 8]} />
            <meshBasicMaterial color={effectivePrimary} transparent opacity={isCurrentUser ? 0.12 : 0.08} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>

          {buildingComponent}

          {/* Landmark glow for current user - NO pointLight */}
          {isCurrentUser && (
            <mesh position={[0, height + 0.5, 0]}>
              <sphereGeometry args={[width * 1.0, 6, 6]} />
              <meshBasicMaterial color="#1DB954" transparent opacity={0.06} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} />
            </mesh>
          )}

          {/* Glow halo for tall buildings */}
          {height > 15 && !isCurrentUser && (
            <mesh position={[0, height + 0.5, 0]}>
              <sphereGeometry args={[width * 0.8, 6, 6]} />
              <meshBasicMaterial color={effectiveAccent} transparent opacity={0.06} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} />
            </mesh>
          )}

          {/* Hover wireframe outline */}
          {hovered && (
            <mesh position={[0, height * 0.5, 0]}>
              <boxGeometry args={[width + 0.3, height + 0.3, depth + 0.3]} />
              <meshBasicMaterial color={effectiveAccent} wireframe transparent opacity={0.25} />
            </mesh>
          )}

          {/* Hover label */}
          {hovered && (
            <Html position={[0, height + 2.5, 0]} center style={{ pointerEvents: 'none' }}>
              <div style={{
                background: 'rgba(8,9,10,0.9)',
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
        </>
      )}
    </group>
  );
}

export default memo(Building);
