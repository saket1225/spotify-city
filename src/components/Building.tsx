'use client';

import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Detailed } from '@react-three/drei';
import * as THREE from 'three';
import { BuildingParams, BuildingStyle } from '@/types';

interface BuildingProps {
  params: BuildingParams;
  onClick: (params: BuildingParams) => void;
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

/* ── Main Building Component ── */
export default function Building({ params, onClick }: BuildingProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
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

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    const pulseScale = highlighted ? Math.sin(t * 3) * 0.03 : 0;
    const targetScale = hovered ? 1.04 : 1 + pulseScale;
    targetScaleVec.current.set(targetScale, targetScale, targetScale);
    groupRef.current.scale.lerp(targetScaleVec.current, 0.08);

    groupRef.current.position.y = Math.sin(t * 0.4 + position[0] * 0.3) * 0.06;

    const targetOpacity = dimmed ? 0.15 : 1;
    opacityRef.current += (targetOpacity - opacityRef.current) * 0.06;

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
  });

  const buildingComponent = useMemo(() => {
    const props = { height, width, depth, primaryColor: effectivePrimary, secondaryColor, accentColor: effectiveAccent, seed };
    switch (style) {
      case 'cathedral':
        // Check if it's jazz (art deco) vs classical (gothic) by checking genres
        if (profile.topGenres.some(g => g.toLowerCase().includes('jazz') || g.toLowerCase().includes('blues'))) {
          return <ArtDecoBuilding {...props} />;
        }
        return <GothicCathedral {...props} />;
      case 'neon-tower':
        return <FuturisticTower {...props} />;
      case 'fortress':
        return <IndustrialFortress {...props} />;
      case 'penthouse':
        return <GraffitiTower {...props} />;
      case 'skyscraper':
        return <PopTower {...props} />;
      case 'brownstone':
        return <BrownstoneBuild {...props} />;
      default:
        return <ModernBuilding {...props} />;
    }
  }, [height, width, depth, effectivePrimary, secondaryColor, effectiveAccent, seed, style, profile.topGenres]);

  return (
    <group
      ref={groupRef}
      position={[position[0], 0, position[2]]}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      onClick={(e) => { e.stopPropagation(); onClick(params); }}
    >
      {/* Ground glow - reduced segments: 12 → 8 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[Math.max(width, depth) * 1.2, 8]} />
        <meshBasicMaterial color={effectivePrimary} transparent opacity={isCurrentUser ? 0.12 : 0.08} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* LOD: Full detail / Medium box / Low box */}
      <Detailed distances={[0, 30, 60]}>
        {/* LOD 0: Full detail */}
        <group>
          {buildingComponent}

          {/* Landmark glow for current user - NO pointLight */}
          {isCurrentUser && (
            <mesh position={[0, height + 0.5, 0]}>
              <sphereGeometry args={[width * 1.0, 6, 6]} />
              <meshBasicMaterial color="#1DB954" transparent opacity={0.06} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} />
            </mesh>
          )}

          {/* Glow halo for tall buildings - reduced segments: 16,16 → 6,6 */}
          {height > 15 && !isCurrentUser && (
            <mesh position={[0, height + 0.5, 0]}>
              <sphereGeometry args={[width * 0.8, 6, 6]} />
              <meshBasicMaterial color={effectiveAccent} transparent opacity={0.06} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} />
            </mesh>
          )}
        </group>

        {/* LOD 1: Medium detail - simple colored box */}
        <mesh position={[0, height * 0.5, 0]}>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color={effectivePrimary} emissive={effectivePrimary} emissiveIntensity={0.15} />
        </mesh>

        {/* LOD 2: Low detail - flat basic box */}
        <mesh position={[0, height * 0.5, 0]}>
          <boxGeometry args={[width, height, depth]} />
          <meshBasicMaterial color={effectivePrimary} />
        </mesh>
      </Detailed>

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
    </group>
  );
}
