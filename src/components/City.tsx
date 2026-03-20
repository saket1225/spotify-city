'use client';

import { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import Building from './Building';
import ExploreCamera from './CityCamera';
import Minimap from './Minimap';
import VirtualJoystick from './VirtualJoystick';
import { BuildingParams } from '@/types';
import { useAmbientSound, SpeakerButton } from './AmbientSound';
import KeyboardShortcuts from './KeyboardShortcuts';
import { playBuildingClick, playModeSwitch } from '@/lib/uiSounds';

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export type TimeOfDay = 'night' | 'dawn' | 'day' | 'sunset';
export type CameraMode = 'orbit' | 'explore';

interface CityProps {
  buildings: BuildingParams[];
  onBuildingClick: (params: BuildingParams) => void;
  onIntroComplete?: () => void;
  focusPosition?: [number, number, number] | null;
  hideControls?: boolean;
}

/* ── Time-of-day color presets ── */
const TIME_PRESETS: Record<TimeOfDay, {
  skyHorizon: [number, number, number];
  skyZenith: [number, number, number];
  fog: string;
  fogNear: number;
  fogFar: number;
  ambient: number;
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
  dirColor: string;
  dirIntensity: number;
  dirPosition: [number, number, number];
  groundColor: string;
  gridColor: string;
  bloomIntensity: number;
  bloomThreshold: number;
  starsVisible: boolean;
  exposure: number;
  particleColor: string;
}> = {
  night: {
    skyHorizon: [0.04, 0.04, 0.12],
    skyZenith: [0.01, 0.01, 0.02],
    fog: '#0a0a1e',
    fogNear: 25,
    fogFar: 85,
    ambient: 0.15,
    hemiSky: '#1a1a3a',
    hemiGround: '#080810',
    hemiIntensity: 0.15,
    dirColor: '#e8e0ff',
    dirIntensity: 0.5,
    dirPosition: [15, 25, 10],
    groundColor: '#0a0a12',
    gridColor: '#1DB954',
    bloomIntensity: 1.4,
    bloomThreshold: 0.3,
    starsVisible: true,
    exposure: 1.1,
    particleColor: '#1DB954',
  },
  dawn: {
    skyHorizon: [0.35, 0.2, 0.35],
    skyZenith: [0.1, 0.05, 0.2],
    fog: '#2a1a2e',
    fogNear: 30,
    fogFar: 100,
    ambient: 0.3,
    hemiSky: '#4a3060',
    hemiGround: '#1a1020',
    hemiIntensity: 0.3,
    dirColor: '#ffaacc',
    dirIntensity: 0.7,
    dirPosition: [-20, 8, 15],
    groundColor: '#12101a',
    gridColor: '#aa66cc',
    bloomIntensity: 1.0,
    bloomThreshold: 0.4,
    starsVisible: true,
    exposure: 1.2,
    particleColor: '#cc88ff',
  },
  day: {
    skyHorizon: [0.55, 0.7, 0.9],
    skyZenith: [0.2, 0.35, 0.7],
    fog: '#88aacc',
    fogNear: 40,
    fogFar: 120,
    ambient: 0.6,
    hemiSky: '#88bbff',
    hemiGround: '#445566',
    hemiIntensity: 0.5,
    dirColor: '#ffffff',
    dirIntensity: 1.2,
    dirPosition: [20, 35, 15],
    groundColor: '#2a2a32',
    gridColor: '#44aa66',
    bloomIntensity: 0.4,
    bloomThreshold: 0.7,
    starsVisible: false,
    exposure: 1.5,
    particleColor: '#88ccaa',
  },
  sunset: {
    skyHorizon: [0.7, 0.3, 0.15],
    skyZenith: [0.15, 0.08, 0.2],
    fog: '#3a2018',
    fogNear: 30,
    fogFar: 95,
    ambient: 0.35,
    hemiSky: '#ff8844',
    hemiGround: '#221510',
    hemiIntensity: 0.35,
    dirColor: '#ffaa55',
    dirIntensity: 0.9,
    dirPosition: [-25, 12, -10],
    groundColor: '#1a1410',
    gridColor: '#ff8844',
    bloomIntensity: 1.2,
    bloomThreshold: 0.35,
    starsVisible: false,
    exposure: 1.3,
    particleColor: '#ffaa44',
  },
};

function lerpColor3(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

/* ── Animated Sky Dome with time transitions ── */
function SkyDome({ time }: { time: TimeOfDay }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const targetPreset = TIME_PRESETS[time];
  const tmpVec3 = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!matRef.current) return;
    const u = matRef.current.uniforms;
    const speed = 0.03;
    tmpVec3.current.set(...targetPreset.skyHorizon);
    u.horizonColor.value.lerp(tmpVec3.current, speed);
    tmpVec3.current.set(...targetPreset.skyZenith);
    u.zenithColor.value.lerp(tmpVec3.current, speed);
  });

  const material = useMemo(() => {
    const preset = TIME_PRESETS.night;
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        horizonColor: { value: new THREE.Vector3(...preset.skyHorizon) },
        zenithColor: { value: new THREE.Vector3(...preset.skyZenith) },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 horizonColor;
        uniform vec3 zenithColor;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition).y;
          float t = clamp(h, 0.0, 1.0);
          t = pow(t, 0.6);
          vec3 color = mix(horizonColor, zenithColor, t);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }, []);

  useEffect(() => {
    if (matRef.current) {
      matRef.current.uniforms = material.uniforms;
    }
  }, [material]);

  return (
    <mesh>
      <sphereGeometry args={[150, 16, 8]} />
      <shaderMaterial ref={matRef} {...material} attach="material" />
    </mesh>
  );
}

/* ── Animated Fog ── */
function AnimatedFog({ time }: { time: TimeOfDay }) {
  const fogRef = useRef<THREE.Fog>(null);
  const preset = TIME_PRESETS[time];
  const tmpColor = useRef(new THREE.Color());

  useFrame(() => {
    if (!fogRef.current) return;
    tmpColor.current.set(preset.fog);
    fogRef.current.color.lerp(tmpColor.current, 0.03);
    fogRef.current.near += (preset.fogNear - fogRef.current.near) * 0.03;
    fogRef.current.far += (preset.fogFar - fogRef.current.far) * 0.03;
  });

  return <fog ref={fogRef} attach="fog" args={['#0a0a1e', 25, 85]} />;
}

/* ── Animated Lighting ── */
function AnimatedLighting({ time }: { time: TimeOfDay }) {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const dirRef = useRef<THREE.DirectionalLight>(null);
  const preset = TIME_PRESETS[time];
  const tmpColor = useRef(new THREE.Color());
  const tmpVec3 = useRef(new THREE.Vector3());

  useFrame(() => {
    const speed = 0.03;
    if (ambientRef.current) {
      ambientRef.current.intensity += (preset.ambient - ambientRef.current.intensity) * speed;
    }
    if (hemiRef.current) {
      tmpColor.current.set(preset.hemiSky);
      hemiRef.current.color.lerp(tmpColor.current, speed);
      tmpColor.current.set(preset.hemiGround);
      hemiRef.current.groundColor.lerp(tmpColor.current, speed);
      hemiRef.current.intensity += (preset.hemiIntensity - hemiRef.current.intensity) * speed;
    }
    if (dirRef.current) {
      tmpColor.current.set(preset.dirColor);
      dirRef.current.color.lerp(tmpColor.current, speed);
      dirRef.current.intensity += (preset.dirIntensity - dirRef.current.intensity) * speed;
      tmpVec3.current.set(...preset.dirPosition);
      dirRef.current.position.lerp(tmpVec3.current, speed);
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.15} />
      <hemisphereLight ref={hemiRef} args={['#1a1a3a', '#080810', 0.15]} />
      <directionalLight ref={dirRef} position={[15, 25, 10]} intensity={0.5} color="#e8e0ff" castShadow={time === 'day' || time === 'sunset'} />
      <pointLight position={[0, 20, 0]} intensity={0.4} color="#1DB954" distance={60} />
    </>
  );
}

/* ── Animated Ground ── */
function AnimatedGround({ time }: { time: TimeOfDay }) {
  const ref = useRef<THREE.MeshStandardMaterial>(null);
  const preset = TIME_PRESETS[time];
  const tmpColor = useRef(new THREE.Color());

  useFrame(() => {
    if (!ref.current) return;
    tmpColor.current.set(preset.groundColor);
    ref.current.color.lerp(tmpColor.current, 0.03);
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial ref={ref} color="#0a0a12" roughness={0.9} metalness={0.1} />
    </mesh>
  );
}

/* ── Sun/Moon ── */
function CelestialBody({ time }: { time: TimeOfDay }) {
  const ref = useRef<THREE.Group>(null);

  const targetPos = useMemo(() => {
    switch (time) {
      case 'night': return new THREE.Vector3(30, 60, -40);
      case 'dawn': return new THREE.Vector3(-50, 15, 30);
      case 'day': return new THREE.Vector3(20, 80, 15);
      case 'sunset': return new THREE.Vector3(-60, 20, -20);
    }
  }, [time]);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.lerp(targetPos, 0.02);
  });

  const isSun = time === 'day' || time === 'sunset' || time === 'dawn';

  return (
    <group ref={ref} position={[30, 60, -40]}>
      <mesh>
        <sphereGeometry args={[isSun ? 4 : 3, 8, 8]} />
        <meshBasicMaterial
          color={isSun ? (time === 'sunset' ? '#ff8833' : time === 'dawn' ? '#ffaacc' : '#ffffee') : '#ddddff'}
        />
      </mesh>
      {/* Glow */}
      <mesh>
        <sphereGeometry args={[isSun ? 8 : 5, 8, 8]} />
        <meshBasicMaterial
          color={isSun ? (time === 'sunset' ? '#ff6600' : '#ffffaa') : '#8888cc'}
          transparent opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

function ShootingStars({ visible }: { visible: boolean }) {
  const count = 3;
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const tmpPos = useRef(new THREE.Vector3());
  const tmpLookAt = useRef(new THREE.Vector3());

  const meteors = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      startTime: i * 3.5,
      duration: 0.6 + Math.random() * 0.4,
      interval: 5 + Math.random() * 5,
      startPos: new THREE.Vector3(
        (Math.random() - 0.5) * 120,
        40 + Math.random() * 30,
        (Math.random() - 0.5) * 120
      ),
      direction: new THREE.Vector3(
        -0.5 + Math.random() * 0.3,
        -0.3 - Math.random() * 0.2,
        -0.3 + Math.random() * 0.3
      ).normalize().multiplyScalar(80),
    }));
  }, []);

  useFrame((state) => {
    if (!visible) {
      meshRefs.current.forEach((m) => { if (m) m.visible = false; });
      return;
    }
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const m = meteors[i];
      const mesh = meshRefs.current[i];
      if (!mesh) continue;

      const cycleTime = (t - m.startTime) % m.interval;
      const progress = cycleTime / m.duration;

      if (progress >= 0 && progress <= 1) {
        mesh.visible = true;
        tmpPos.current.copy(m.startPos).addScaledVector(m.direction, progress);
        mesh.position.copy(tmpPos.current);
        tmpLookAt.current.copy(tmpPos.current).add(m.direction);
        mesh.lookAt(tmpLookAt.current);
        const fade = progress < 0.2 ? progress / 0.2 : progress > 0.7 ? (1 - progress) / 0.3 : 1;
        (mesh.material as THREE.MeshBasicMaterial).opacity = fade * 0.9;
        mesh.scale.set(1, 1, 1 + progress * 2);
      } else {
        mesh.visible = false;
      }
    }
  });

  return (
    <group>
      {meteors.map((_, i) => (
        <mesh key={`meteor-${i}`} ref={(el) => { meshRefs.current[i] = el; }} visible={false}>
          <boxGeometry args={[0.05, 0.05, 3]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function AnimatedGrid({ buildings, time }: { buildings: BuildingParams[]; time: TimeOfDay }) {
  const ref = useRef<THREE.ShaderMaterial>(null);
  const preset = TIME_PRESETS[time];
  const tmpColor = useRef(new THREE.Color());

  const buildingData = useMemo(() => {
    const maxBuildings = 32;
    const positions = new Float32Array(maxBuildings * 2);
    const count = Math.min(buildings.length, maxBuildings);
    for (let i = 0; i < count; i++) {
      positions[i * 2] = buildings[i].position[0];
      positions[i * 2 + 1] = buildings[i].position[2];
    }
    return { positions, count };
  }, [buildings]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#1DB954') },
    uBuildingPositions: { value: buildingData.positions },
    uBuildingCount: { value: buildingData.count },
  }), [buildingData]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.uniforms.uTime.value = state.clock.elapsedTime;
      tmpColor.current.set(preset.gridColor);
      ref.current.uniforms.uColor.value.lerp(tmpColor.current, 0.03);
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <planeGeometry args={[200, 200, 100, 100]} />
      <shaderMaterial
        ref={ref}
        transparent
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          varying vec3 vPos;
          void main() {
            vUv = uv;
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uColor;
          uniform float uBuildingPositions[64];
          uniform int uBuildingCount;
          varying vec2 vUv;
          varying vec3 vPos;
          void main() {
            vec2 grid = abs(fract(vPos.xy * 0.1) - 0.5);
            float line = min(grid.x, grid.y);
            float gridLine = 1.0 - smoothstep(0.0, 0.02, line);

            float dist = length(vPos.xy);
            float pulse = sin(dist * 0.08 - uTime * 0.8) * 0.5 + 0.5;
            float fade = 1.0 - smoothstep(0.0, 80.0, dist);

            float buildingProximity = 0.0;
            for (int i = 0; i < 32; i++) {
              if (i >= uBuildingCount) break;
              vec2 bPos = vec2(uBuildingPositions[i * 2], uBuildingPositions[i * 2 + 1]);
              float bDist = length(vPos.xy - bPos);
              buildingProximity += smoothstep(8.0, 0.5, bDist) * 0.4;
            }
            buildingProximity = min(buildingProximity, 1.0);

            float alpha = gridLine * fade * (0.18 + pulse * 0.12 + buildingProximity * 0.25);
            gl_FragColor = vec4(uColor, alpha);
          }
        `}
      />
    </mesh>
  );
}

function FloatingParticles({ time }: { time: TimeOfDay }) {
  const count = 80;
  const ref = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);
  const preset = TIME_PRESETS[time];
  const tmpColor = useRef(new THREE.Color());

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 1] = Math.random() * 35;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80;
      spd[i] = 0.01 + Math.random() * 0.04;
    }
    return [pos, spd];
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const posAttr = ref.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i];
      if (arr[i * 3 + 1] > 40) {
        arr[i * 3 + 1] = 0;
        arr[i * 3] = (Math.random() - 0.5) * 80;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 80;
      }
    }
    posAttr.needsUpdate = true;
    if (matRef.current) {
      tmpColor.current.set(preset.particleColor);
      matRef.current.color.lerp(tmpColor.current, 0.03);
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial ref={matRef} color="#1DB954" size={0.4} transparent opacity={0.85} sizeAttenuation />
    </points>
  );
}

function DustParticles() {
  const count = 50;
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 1] = Math.random() * 25;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const posAttr = ref.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      arr[i * 3] += Math.sin(t * 0.1 + i * 0.5) * 0.005;
      arr[i * 3 + 1] += Math.cos(t * 0.15 + i * 0.3) * 0.003;
      arr[i * 3 + 2] += Math.sin(t * 0.12 + i * 0.7) * 0.005;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial color="#8888ff" size={0.12} transparent opacity={0.35} sizeAttenuation />
    </points>
  );
}

/* ── Street Furniture using InstancedMesh ── */
function StreetFurniture({ buildings }: { buildings: BuildingParams[] }) {
  const items = useMemo(() => {
    const lamps: [number, number, number][] = [];
    const trees: { pos: [number, number, number]; scale: number }[] = [];
    const benches: { pos: [number, number, number]; rot: number }[] = [];

    for (let i = 0; i < buildings.length; i++) {
      const b = buildings[i];
      const seed = b.position[0] * 73 + b.position[2] * 137;
      const rand = (n: number) => {
        const x = Math.sin(seed * 127.1 + n * 311.7) * 43758.5453;
        return x - Math.floor(x);
      };

      if (rand(1) > 0.3) {
        const angle = rand(2) * Math.PI * 2;
        const dist = b.width * 0.8 + 1.5;
        lamps.push([b.position[0] + Math.cos(angle) * dist, 0, b.position[2] + Math.sin(angle) * dist]);
      }
      if (rand(3) > 0.4) {
        const angle = rand(4) * Math.PI * 2;
        const dist = b.width * 0.8 + 2;
        trees.push({ pos: [b.position[0] + Math.cos(angle) * dist, 0, b.position[2] + Math.sin(angle) * dist], scale: 0.6 + rand(5) * 0.8 });
      }
      if (rand(6) > 0.6) {
        const angle = rand(7) * Math.PI * 2;
        const dist = b.width * 0.8 + 1.8;
        benches.push({ pos: [b.position[0] + Math.cos(angle) * dist, 0, b.position[2] + Math.sin(angle) * dist], rot: rand(8) * Math.PI * 2 });
      }
    }
    return { lamps, trees, benches };
  }, [buildings]);

  // Shared geometries and materials
  const lampPoleGeo = useMemo(() => new THREE.CylinderGeometry(0.03, 0.04, 1.6, 6), []);
  const lampArmGeo = useMemo(() => new THREE.CylinderGeometry(0.02, 0.02, 0.4, 4), []);
  const lampGlobeGeo = useMemo(() => new THREE.SphereGeometry(0.06, 8, 8), []);
  const lampPoleMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#333333', roughness: 0.4, metalness: 0.8 }), []);
  const lampGlobeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffeecc', emissive: '#ffdd88', emissiveIntensity: 2 }), []);

  const trunkGeo = useMemo(() => new THREE.CylinderGeometry(0.04, 0.06, 0.6, 5), []);
  const cone1Geo = useMemo(() => new THREE.ConeGeometry(0.25, 0.5, 6), []);
  const cone2Geo = useMemo(() => new THREE.ConeGeometry(0.2, 0.4, 6), []);
  const trunkMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#5a3a20', roughness: 0.9 }), []);
  const leaf1Mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1a5a2a', emissive: '#0a2a0a', emissiveIntensity: 0.1 }), []);
  const leaf2Mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#226633', emissive: '#0a2a0a', emissiveIntensity: 0.1 }), []);

  const benchSeatGeo = useMemo(() => new THREE.BoxGeometry(0.5, 0.04, 0.15), []);
  const benchLegGeo = useMemo(() => new THREE.BoxGeometry(0.03, 0.14, 0.12), []);
  const benchBackGeo = useMemo(() => new THREE.BoxGeometry(0.5, 0.15, 0.02), []);
  const benchWoodMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#5a3a1a', roughness: 0.8, metalness: 0.1 }), []);
  const benchMetalMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#444', roughness: 0.5, metalness: 0.7 }), []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Lamp instanced meshes
  const lampPoleRef = useRef<THREE.InstancedMesh>(null);
  const lampArmRef = useRef<THREE.InstancedMesh>(null);
  const lampGlobeRef = useRef<THREE.InstancedMesh>(null);

  // Tree instanced meshes
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const cone1Ref = useRef<THREE.InstancedMesh>(null);
  const cone2Ref = useRef<THREE.InstancedMesh>(null);

  // Bench instanced meshes
  const benchSeatRef = useRef<THREE.InstancedMesh>(null);
  const benchLeg1Ref = useRef<THREE.InstancedMesh>(null);
  const benchLeg2Ref = useRef<THREE.InstancedMesh>(null);
  const benchBackRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    // Set lamp matrices
    items.lamps.forEach((pos, i) => {
      // Pole
      if (lampPoleRef.current) {
        dummy.position.set(pos[0], pos[1] + 0.8, pos[2]);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        lampPoleRef.current.setMatrixAt(i, dummy.matrix);
      }
      // Arm
      if (lampArmRef.current) {
        dummy.position.set(pos[0] + 0.15, pos[1] + 1.5, pos[2]);
        dummy.rotation.set(0, 0, Math.PI / 6);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        lampArmRef.current.setMatrixAt(i, dummy.matrix);
      }
      // Globe
      if (lampGlobeRef.current) {
        dummy.position.set(pos[0] + 0.25, pos[1] + 1.55, pos[2]);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        lampGlobeRef.current.setMatrixAt(i, dummy.matrix);
      }
    });
    if (lampPoleRef.current) lampPoleRef.current.instanceMatrix.needsUpdate = true;
    if (lampArmRef.current) lampArmRef.current.instanceMatrix.needsUpdate = true;
    if (lampGlobeRef.current) lampGlobeRef.current.instanceMatrix.needsUpdate = true;

    // Set tree matrices
    items.trees.forEach((t, i) => {
      const s = t.scale;
      // Trunk
      if (trunkRef.current) {
        dummy.position.set(t.pos[0], t.pos[1] + 0.3 * s, t.pos[2]);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();
        trunkRef.current.setMatrixAt(i, dummy.matrix);
      }
      // Cone 1
      if (cone1Ref.current) {
        dummy.position.set(t.pos[0], t.pos[1] + 0.7 * s, t.pos[2]);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();
        cone1Ref.current.setMatrixAt(i, dummy.matrix);
      }
      // Cone 2
      if (cone2Ref.current) {
        dummy.position.set(t.pos[0], t.pos[1] + 0.95 * s, t.pos[2]);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();
        cone2Ref.current.setMatrixAt(i, dummy.matrix);
      }
    });
    if (trunkRef.current) trunkRef.current.instanceMatrix.needsUpdate = true;
    if (cone1Ref.current) cone1Ref.current.instanceMatrix.needsUpdate = true;
    if (cone2Ref.current) cone2Ref.current.instanceMatrix.needsUpdate = true;

    // Set bench matrices
    items.benches.forEach((b, i) => {
      const cos = Math.cos(b.rot);
      const sin = Math.sin(b.rot);
      // Seat
      if (benchSeatRef.current) {
        dummy.position.set(b.pos[0], b.pos[1] + 0.15, b.pos[2]);
        dummy.rotation.set(0, b.rot, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        benchSeatRef.current.setMatrixAt(i, dummy.matrix);
      }
      // Leg 1
      if (benchLeg1Ref.current) {
        dummy.position.set(b.pos[0] + cos * -0.2, b.pos[1] + 0.07, b.pos[2] + sin * -0.2);
        dummy.rotation.set(0, b.rot, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        benchLeg1Ref.current.setMatrixAt(i, dummy.matrix);
      }
      // Leg 2
      if (benchLeg2Ref.current) {
        dummy.position.set(b.pos[0] + cos * 0.2, b.pos[1] + 0.07, b.pos[2] + sin * 0.2);
        dummy.rotation.set(0, b.rot, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        benchLeg2Ref.current.setMatrixAt(i, dummy.matrix);
      }
      // Back
      if (benchBackRef.current) {
        dummy.position.set(b.pos[0] + sin * 0.06, b.pos[1] + 0.28, b.pos[2] - cos * 0.06);
        dummy.rotation.set(0, b.rot, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        benchBackRef.current.setMatrixAt(i, dummy.matrix);
      }
    });
    if (benchSeatRef.current) benchSeatRef.current.instanceMatrix.needsUpdate = true;
    if (benchLeg1Ref.current) benchLeg1Ref.current.instanceMatrix.needsUpdate = true;
    if (benchLeg2Ref.current) benchLeg2Ref.current.instanceMatrix.needsUpdate = true;
    if (benchBackRef.current) benchBackRef.current.instanceMatrix.needsUpdate = true;
  }, [items, dummy]);

  const lampCount = items.lamps.length;
  const treeCount = items.trees.length;
  const benchCount = items.benches.length;

  return (
    <group>
      {lampCount > 0 && (
        <>
          <instancedMesh ref={lampPoleRef} args={[lampPoleGeo, lampPoleMat, lampCount]} />
          <instancedMesh ref={lampArmRef} args={[lampArmGeo, lampPoleMat, lampCount]} />
          <instancedMesh ref={lampGlobeRef} args={[lampGlobeGeo, lampGlobeMat, lampCount]} />
        </>
      )}
      {treeCount > 0 && (
        <>
          <instancedMesh ref={trunkRef} args={[trunkGeo, trunkMat, treeCount]} />
          <instancedMesh ref={cone1Ref} args={[cone1Geo, leaf1Mat, treeCount]} />
          <instancedMesh ref={cone2Ref} args={[cone2Geo, leaf2Mat, treeCount]} />
        </>
      )}
      {benchCount > 0 && (
        <>
          <instancedMesh ref={benchSeatRef} args={[benchSeatGeo, benchWoodMat, benchCount]} />
          <instancedMesh ref={benchLeg1Ref} args={[benchLegGeo, benchMetalMat, benchCount]} />
          <instancedMesh ref={benchLeg2Ref} args={[benchLegGeo, benchMetalMat, benchCount]} />
          <instancedMesh ref={benchBackRef} args={[benchBackGeo, benchWoodMat, benchCount]} />
        </>
      )}
    </group>
  );
}

/* ── Clouds (day/sunset only) ── */
function Clouds({ time }: { time: TimeOfDay }) {
  const visible = time === 'day' || time === 'sunset' || time === 'dawn';
  const ref = useRef<THREE.Group>(null);

  const clouds = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      pos: [(Math.random() - 0.5) * 150, 35 + Math.random() * 20, (Math.random() - 0.5) * 150] as [number, number, number],
      scale: 1 + Math.random() * 2,
      speed: 0.02 + Math.random() * 0.03,
    }))
  , []);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.children.forEach((child, i) => {
      child.position.x += clouds[i].speed;
      if (child.position.x > 80) child.position.x = -80;
    });
    ref.current.visible = visible;
  });

  return (
    <group ref={ref}>
      {clouds.map((c, i) => (
        <mesh key={`cloud-${i}`} position={c.pos} scale={c.scale}>
          <sphereGeometry args={[2, 8, 6]} />
          <meshBasicMaterial
            color={time === 'sunset' ? '#ffccaa' : time === 'dawn' ? '#ddaacc' : '#ffffff'}
            transparent opacity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ── Weather / Mood Particles per time of day ── */
const WEATHER_CONFIG: Record<TimeOfDay, {
  color: [number, number, number];
  size: number;
  opacity: number;
  speed: number;        // vertical drift speed
  wanderX: number;      // horizontal wander amplitude
  wanderZ: number;
  fadeHeight: number;    // y at which particles reset
  yBase: number;         // spawn y range base
  yRange: number;        // spawn y range
}> = {
  night:  { color: [1.0, 0.85, 0.4],  size: 0.15, opacity: 0.6, speed: 0.008, wanderX: 0.015, wanderZ: 0.015, fadeHeight: 30, yBase: 1, yRange: 20 },
  dawn:   { color: [1.0, 1.0, 1.0],   size: 0.35, opacity: 0.25, speed: 0.012, wanderX: 0.005, wanderZ: 0.005, fadeHeight: 25, yBase: 0, yRange: 12 },
  day:    { color: [1.0, 1.0, 0.9],   size: 0.08, opacity: 0.4, speed: 0.003, wanderX: 0.008, wanderZ: 0.008, fadeHeight: 30, yBase: 2, yRange: 25 },
  sunset: { color: [1.0, 0.6, 0.2],   size: 0.18, opacity: 0.45, speed: 0.006, wanderX: 0.01, wanderZ: 0.01, fadeHeight: 28, yBase: 1, yRange: 18 },
};

function WeatherParticles({ time }: { time: TimeOfDay }) {
  const count = 70;
  const ref = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);
  const targetColor = useRef(new THREE.Color());
  const currentConfig = useRef(WEATHER_CONFIG[time]);

  const [positions, phases] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 70;
      pos[i * 3 + 1] = Math.random() * 25;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 70;
      ph[i] = Math.random() * Math.PI * 2;
    }
    return [pos, ph];
  }, []);

  useFrame((state) => {
    if (!ref.current || !matRef.current) return;
    const cfg = WEATHER_CONFIG[time];
    const cur = currentConfig.current;
    const lerpSpeed = 0.02;

    // Smoothly interpolate config values
    cur.speed += (cfg.speed - cur.speed) * lerpSpeed;
    cur.wanderX += (cfg.wanderX - cur.wanderX) * lerpSpeed;
    cur.wanderZ += (cfg.wanderZ - cur.wanderZ) * lerpSpeed;
    cur.fadeHeight += (cfg.fadeHeight - cur.fadeHeight) * lerpSpeed;
    cur.yBase += (cfg.yBase - cur.yBase) * lerpSpeed;
    cur.yRange += (cfg.yRange - cur.yRange) * lerpSpeed;

    // Lerp material properties
    targetColor.current.setRGB(...cfg.color);
    matRef.current.color.lerp(targetColor.current, 0.03);
    matRef.current.size += (cfg.size - matRef.current.size) * 0.03;
    matRef.current.opacity += (cfg.opacity - matRef.current.opacity) * 0.03;

    const t = state.clock.elapsedTime;
    const posAttr = ref.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const phase = phases[i];
      arr[i * 3] += Math.sin(t * 0.3 + phase) * cur.wanderX;
      arr[i * 3 + 1] += cur.speed;
      arr[i * 3 + 2] += Math.cos(t * 0.25 + phase * 1.3) * cur.wanderZ;

      if (arr[i * 3 + 1] > cur.fadeHeight) {
        arr[i * 3] = (Math.random() - 0.5) * 70;
        arr[i * 3 + 1] = cur.yBase;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 70;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        color={new THREE.Color(...WEATHER_CONFIG.night.color)}
        size={WEATHER_CONFIG.night.size}
        transparent
        opacity={WEATHER_CONFIG.night.opacity}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function CinematicIntro({ onComplete }: { onComplete: () => void }) {
  const { camera } = useThree();
  const completedRef = useRef(false);

  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(80, 50, 80),
      new THREE.Vector3(40, 25, -20),
      new THREE.Vector3(30, 16, 30),
    ]);
  }, []);

  useFrame((state) => {
    if (completedRef.current) return;
    const elapsed = state.clock.elapsedTime;
    const duration = 4;
    const t = Math.min(elapsed / duration, 1);
    const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const point = curve.getPoint(eased);
    camera.position.copy(point);
    camera.lookAt(0, 0, 0);
    if (t >= 1) {
      completedRef.current = true;
      onComplete();
    }
  });

  return null;
}

function SmartOrbitControls({ enabled = true, orbitRef }: {
  enabled?: boolean;
  orbitRef: React.MutableRefObject<React.ComponentRef<typeof OrbitControls> | null>;
}) {
  const autoRotateRef = useRef(true);

  const handleInteraction = useCallback(() => {
    autoRotateRef.current = false;
    if (orbitRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (orbitRef.current as any).autoRotate = false;
    }
  }, [orbitRef]);

  return (
    <OrbitControls
      ref={orbitRef}
      enabled={enabled}
      enableDamping
      dampingFactor={0.05}
      minDistance={8}
      maxDistance={65}
      maxPolarAngle={Math.PI / 2.05}
      autoRotate
      autoRotateSpeed={0.3}
      onStart={handleInteraction}
    />
  );
}

/* ── Bloom with animated params ── */
function AnimatedBloom({ time }: { time: TimeOfDay }) {
  const preset = TIME_PRESETS[time];
  return (
    <EffectComposer>
      <Bloom
        intensity={preset.bloomIntensity}
        luminanceThreshold={preset.bloomThreshold}
        luminanceSmoothing={0.4}
        mipmapBlur
        width={256}
        height={256}
      />
    </EffectComposer>
  );
}

/* ── Exposure controller ── */
function ExposureController({ time }: { time: TimeOfDay }) {
  const { gl } = useThree();
  const preset = TIME_PRESETS[time];

  useFrame(() => {
    gl.toneMappingExposure += (preset.exposure - gl.toneMappingExposure) * 0.03;
  });

  return null;
}

/* ── Camera position tracker for minimap ── */
function CameraTracker({ onUpdate }: { onUpdate: (pos: [number, number, number], rotY: number) => void }) {
  const { camera } = useThree();
  const callbackRef = useRef(onUpdate);
  callbackRef.current = onUpdate;
  const frameCount = useRef(0);
  const eulerRef = useRef(new THREE.Euler());

  useFrame(() => {
    if (++frameCount.current % 3 !== 0) return;
    eulerRef.current.setFromQuaternion(camera.quaternion, 'YXZ');
    callbackRef.current(
      [camera.position.x, camera.position.y, camera.position.z],
      eulerRef.current.y
    );
  });

  return null;
}

/* ── Floating artist labels (orbit mode, top 5 tallest) ── */
function FloatingLabels({ buildings, visible }: { buildings: BuildingParams[]; visible: boolean }) {
  const top5 = useMemo(() => {
    return [...buildings].sort((a, b) => b.height - a.height).slice(0, 5);
  }, [buildings]);

  const { camera } = useThree();
  const [opacities, setOpacities] = useState<number[]>([0, 0, 0, 0, 0]);
  const frameCount = useRef(0);

  useFrame(() => {
    if (!visible) return;
    if (++frameCount.current % 6 !== 0) return;
    const newOp = top5.map((b) => {
      const dist = camera.position.distanceTo(new THREE.Vector3(...b.position));
      if (dist > 40) return 0;
      if (dist < 20) return 1;
      return 1 - (dist - 20) / 20;
    });
    setOpacities(newOp);
  });

  if (!visible) return null;

  return (
    <>
      {top5.map((b, i) => (
        <Html
          key={b.profile.id}
          position={[b.position[0], b.height + 1.5, b.position[2]]}
          center
          distanceFactor={12}
          style={{
            opacity: opacities[i],
            transition: 'opacity 0.3s',
            pointerEvents: 'none',
          }}
        >
          <div style={{
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(6px)',
            padding: '3px 8px',
            borderRadius: 6,
            fontSize: 11,
            color: '#fff',
            whiteSpace: 'nowrap',
            fontFamily: 'system-ui',
            letterSpacing: '0.02em',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            {b.profile.topArtists?.[0]?.name || b.profile.displayName}
          </div>
        </Html>
      ))}
    </>
  );
}

/* ── Main City export ── */
export default function City({ buildings, onBuildingClick, onIntroComplete, focusPosition, hideControls }: CityProps) {
  const [introComplete, setIntroComplete] = useState(false);
  const [time, setTime] = useState<TimeOfDay>('night');
  const [autoCycle, setAutoCycle] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('spotify-city-autocycle') === 'true';
    }
    return false;
  });

  // Persist auto-cycle state
  useEffect(() => {
    localStorage.setItem('spotify-city-autocycle', String(autoCycle));
  }, [autoCycle]);

  // Auto-cycle interval
  useEffect(() => {
    if (!autoCycle) return;
    const order: TimeOfDay[] = ['night', 'dawn', 'day', 'sunset'];
    const interval = setInterval(() => {
      setTime(prev => order[(order.indexOf(prev) + 1) % 4]);
    }, 20000);
    return () => clearInterval(interval);
  }, [autoCycle]);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const { muted: soundMuted, toggle: toggleSound } = useAmbientSound(time);
  const [cameraMode, setCameraMode] = useState<CameraMode>('orbit');
  const [flyTarget, setFlyTarget] = useState<[number, number, number] | null>(null);
  const [camPos, setCamPos] = useState<[number, number, number]>([30, 16, 30]);
  const [camRotY, setCamRotY] = useState(0);
  const orbitRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
    onIntroComplete?.();
  }, [onIntroComplete]);

  const handleCameraUpdate = useCallback((pos: [number, number, number], rotY: number) => {
    setCamPos(pos);
    setCamRotY(rotY);
  }, []);

  const handleBuildingDoubleClick = useCallback((params: BuildingParams) => {
    if (cameraMode === 'explore') {
      setFlyTarget([params.position[0], params.height, params.position[2]]);
    }
    playBuildingClick(params.height);
    onBuildingClick(params);
  }, [cameraMode, onBuildingClick]);

  const handleMinimapClick = useCallback((building: BuildingParams) => {
    if (cameraMode === 'explore') {
      setFlyTarget([building.position[0], building.height, building.position[2]]);
    }
  }, [cameraMode]);

  // '?' key opens shortcuts overlay
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === '?') {
        e.preventDefault();
        setShortcutsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const preset = TIME_PRESETS[time];
  const isExplore = cameraMode === 'explore';

  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const joystickMoveRef = useRef({ x: 0, y: 0 });

  const handleJoystickMove = useCallback((dx: number, dy: number) => {
    joystickMoveRef.current = { x: dx, y: dy };
  }, []);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const [webglSupported, setWebglSupported] = useState(true);
  useEffect(() => { setWebglSupported(detectWebGL()); }, []);

  if (!webglSupported) {
    return (
      <div style={{
        width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#08090a', color: 'rgba(255,255,255,0.6)', fontFamily: 'system-ui', textAlign: 'center',
        flexDirection: 'column', gap: 12, padding: 32,
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
          <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <p style={{ fontSize: 16, fontWeight: 500 }}>Your browser doesn&apos;t support WebGL.</p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Try Chrome or Firefox for the full 3D experience.</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Controls UI */}
      {!hideControls && <div className="absolute top-[60px] right-3 sm:right-4 z-20 flex flex-col gap-1.5 sm:gap-1.5">
        {/* Camera mode toggle */}
        <button
          onClick={() => { playModeSwitch(); setCameraMode(m => m === 'orbit' ? 'explore' : 'orbit'); }}
          title={isExplore ? 'Switch to Orbit' : 'Switch to Explore (WASD)'}
          className="w-11 h-11 sm:w-9 sm:h-9 rounded-[10px] flex items-center justify-center transition-all duration-200 cursor-pointer"
          style={{
            border: isExplore ? '2px solid rgba(29,185,84,0.8)' : '1px solid rgba(255,255,255,0.1)',
            background: isExplore ? 'rgba(29,185,84,0.15)' : 'rgba(8,9,10,0.7)',
            backdropFilter: 'blur(10px)',
            color: isExplore ? '#1DB954' : 'rgba(255,255,255,0.5)',
            boxShadow: isExplore ? '0 0 12px rgba(29,185,84,0.3)' : 'none',
          }}
        >
          {isExplore ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2"/><path d="m16 21-3-12M8 21l3-12m-1-3-2 3h6l-2-3"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18"/><path d="m16 8-4 4-4-4"/></svg>
          )}
        </button>

        {/* Divider */}
        <div className="h-px mx-1 bg-white/10" />

        {/* Time-of-day toggle */}
        {([
          { key: 'night', label: 'Night', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg> },
          { key: 'dawn', label: 'Dawn', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4m-7.07 2.93 2.83 2.83M2 16h4m12 0h4m-4.24-6.24 2.83-2.83M12 16a4 4 0 1 0 0-8"/><path d="M2 20h20"/></svg> },
          { key: 'day', label: 'Day', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg> },
          { key: 'sunset', label: 'Sunset', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 10V2m-7.07 8.93 2.83 2.83M2 18h4m12 0h4m-4.24-6.24 2.83-2.83M12 18a4 4 0 1 0 0-8"/><path d="M2 22h20"/></svg> },
        ] as const).map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => { setAutoCycle(false); setTime(key); }}
            title={label}
            className="w-11 h-11 sm:w-9 sm:h-9 rounded-[10px] flex items-center justify-center transition-all duration-200 cursor-pointer"
            style={{
              border: time === key ? '2px solid rgba(29,185,84,0.8)' : '1px solid rgba(255,255,255,0.1)',
              background: time === key ? 'rgba(29,185,84,0.15)' : 'rgba(8,9,10,0.7)',
              backdropFilter: 'blur(10px)',
              color: time === key ? '#1DB954' : 'rgba(255,255,255,0.5)',
              boxShadow: time === key ? '0 0 12px rgba(29,185,84,0.3)' : 'none',
            }}
          >
            {icon}
          </button>
        ))}

        {/* Auto-cycle toggle */}
        <button
          onClick={() => setAutoCycle(c => !c)}
          title={autoCycle ? 'Stop auto-cycle' : 'Auto-cycle time of day'}
          className="w-11 h-11 sm:w-9 sm:h-9 rounded-[10px] flex items-center justify-center transition-all duration-200 cursor-pointer"
          style={{
            border: autoCycle ? '2px solid rgba(29,185,84,0.8)' : '1px solid rgba(255,255,255,0.1)',
            background: autoCycle ? 'rgba(29,185,84,0.15)' : 'rgba(8,9,10,0.7)',
            backdropFilter: 'blur(10px)',
            color: autoCycle ? '#1DB954' : 'rgba(255,255,255,0.5)',
            boxShadow: autoCycle ? '0 0 12px rgba(29,185,84,0.3)' : 'none',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={autoCycle ? { animation: 'spin 2s linear infinite' } : undefined}>
            <path d="M21 12a9 9 0 1 1-6.22-8.56" />
            <path d="M21 3v6h-6" />
          </svg>
        </button>

        {/* Divider */}
        <div className="h-px mx-1 bg-white/10" />

        {/* Sound toggle */}
        <SpeakerButton muted={soundMuted} onToggle={toggleSound} />

        {/* Divider */}
        <div className="h-px mx-1 bg-white/10 hidden sm:block" />

        {/* Keyboard shortcuts button - desktop only */}
        <button
          onClick={() => setShortcutsOpen(true)}
          title="Keyboard Shortcuts (?)"
          className="w-11 h-11 sm:w-9 sm:h-9 rounded-[10px] items-center justify-center transition-all duration-200 cursor-pointer hidden sm:flex"
          style={{
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(8,9,10,0.7)',
            backdropFilter: 'blur(10px)',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 14,
            fontWeight: 700,
            fontFamily: 'system-ui',
          }}
        >
          ?
        </button>
      </div>}

      <KeyboardShortcuts open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      {/* Control hints when in explore mode */}
      {isExplore && introComplete && !isTouchDevice && (
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          background: 'rgba(8,9,10,0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: 10,
          padding: '6px 14px',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.4)',
          fontSize: 11,
          fontFamily: 'system-ui',
          whiteSpace: 'nowrap',
        }}>
          WASD move · Mouse drag look · Scroll altitude · Space↑ Shift↓ · Double-click building to fly
        </div>
      )}

      {/* Touch hint (mobile only, explore mode) */}
      {isExplore && introComplete && isTouchDevice && (
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          background: 'rgba(8,9,10,0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: 10,
          padding: '6px 14px',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.4)',
          fontSize: 11,
          fontFamily: 'system-ui',
          whiteSpace: 'nowrap',
        }}>
          Joystick move · Drag look · Pinch zoom · Tap building · Double-tap fly
        </div>
      )}

      {/* Virtual joystick (touch devices, explore mode) */}
      {isExplore && introComplete && isTouchDevice && (
        <VirtualJoystick onMove={handleJoystickMove} />
      )}

      {/* Minimap (explore mode only, hidden on very small screens) */}
      {isExplore && introComplete && (
        <div className="hidden sm:block">
          <Minimap
            buildings={buildings}
            cameraPosition={camPos}
            cameraRotation={camRotY}
            onBuildingClick={handleMinimapClick}
          />
        </div>
      )}

      <Canvas
        camera={{ position: [80, 50, 80], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1, preserveDrawingBuffer: true }}
      >
        <CameraTracker onUpdate={handleCameraUpdate} />

        <SkyDome time={time} />
        <AnimatedFog time={time} />
        <AnimatedLighting time={time} />
        <CelestialBody time={time} />
        <Clouds time={time} />
        <ExposureController time={time} />

        {preset.starsVisible && <Stars radius={120} depth={60} count={1500} factor={5} fade speed={0.3} />}
        <ShootingStars visible={preset.starsVisible} />

        <AnimatedGround time={time} />
        <AnimatedGrid buildings={buildings} time={time} />
        <FloatingParticles time={time} />
        <DustParticles />
        <WeatherParticles time={time} />
        <StreetFurniture buildings={buildings} />

        {buildings.map((b, i) => (
          <Building
            key={b.profile.id || i}
            params={b}
            onClick={handleBuildingDoubleClick}
          />
        ))}

        <FloatingLabels buildings={buildings} visible={cameraMode === 'orbit' && introComplete} />

        {!introComplete && <CinematicIntro onComplete={handleIntroComplete} />}

        {/* Camera controls: orbit or explore */}
        {cameraMode === 'orbit' && (
          <SmartOrbitControls enabled={introComplete} orbitRef={orbitRef} />
        )}
        {cameraMode === 'explore' && introComplete && (
          <ExploreCamera
            enabled={true}
            flyTarget={flyTarget}
            onFlyComplete={() => setFlyTarget(null)}
            joystickInput={joystickMoveRef}
          />
        )}

        <AnimatedBloom time={time} />
      </Canvas>
    </div>
  );
}
