'use client';

import { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import Building from './Building';
import { BuildingParams } from '@/types';

export type TimeOfDay = 'night' | 'dawn' | 'day' | 'sunset';

interface CityProps {
  buildings: BuildingParams[];
  onBuildingClick: (params: BuildingParams) => void;
  onIntroComplete?: () => void;
  focusPosition?: [number, number, number] | null;
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

  useFrame(() => {
    if (!matRef.current) return;
    const u = matRef.current.uniforms;
    const speed = 0.03;
    u.horizonColor.value.lerp(new THREE.Vector3(...targetPreset.skyHorizon), speed);
    u.zenithColor.value.lerp(new THREE.Vector3(...targetPreset.skyZenith), speed);
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
      <sphereGeometry args={[150, 32, 16]} />
      <shaderMaterial ref={matRef} {...material} attach="material" />
    </mesh>
  );
}

/* ── Animated Fog ── */
function AnimatedFog({ time }: { time: TimeOfDay }) {
  const fogRef = useRef<THREE.Fog>(null);
  const preset = TIME_PRESETS[time];

  useFrame(() => {
    if (!fogRef.current) return;
    const target = new THREE.Color(preset.fog);
    fogRef.current.color.lerp(target, 0.03);
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

  useFrame(() => {
    const speed = 0.03;
    if (ambientRef.current) {
      ambientRef.current.intensity += (preset.ambient - ambientRef.current.intensity) * speed;
    }
    if (hemiRef.current) {
      hemiRef.current.color.lerp(new THREE.Color(preset.hemiSky), speed);
      hemiRef.current.groundColor.lerp(new THREE.Color(preset.hemiGround), speed);
      hemiRef.current.intensity += (preset.hemiIntensity - hemiRef.current.intensity) * speed;
    }
    if (dirRef.current) {
      dirRef.current.color.lerp(new THREE.Color(preset.dirColor), speed);
      dirRef.current.intensity += (preset.dirIntensity - dirRef.current.intensity) * speed;
      dirRef.current.position.lerp(new THREE.Vector3(...preset.dirPosition), speed);
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.15} />
      <hemisphereLight ref={hemiRef} args={['#1a1a3a', '#080810', 0.15]} />
      <directionalLight ref={dirRef} position={[15, 25, 10]} intensity={0.5} color="#e8e0ff" castShadow={time === 'day' || time === 'sunset'} />
      <pointLight position={[0, 20, 0]} intensity={0.4} color="#1DB954" distance={60} />
      <pointLight position={[-20, 8, -20]} intensity={0.3} color="#4169E1" distance={40} />
      <pointLight position={[20, 8, 20]} intensity={0.3} color="#FF69B4" distance={40} />
    </>
  );
}

/* ── Animated Ground ── */
function AnimatedGround({ time }: { time: TimeOfDay }) {
  const ref = useRef<THREE.MeshStandardMaterial>(null);
  const preset = TIME_PRESETS[time];

  useFrame(() => {
    if (!ref.current) return;
    ref.current.color.lerp(new THREE.Color(preset.groundColor), 0.03);
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
        <sphereGeometry args={[isSun ? 4 : 3, 16, 16]} />
        <meshBasicMaterial
          color={isSun ? (time === 'sunset' ? '#ff8833' : time === 'dawn' ? '#ffaacc' : '#ffffee') : '#ddddff'}
        />
      </mesh>
      {/* Glow */}
      <mesh>
        <sphereGeometry args={[isSun ? 8 : 5, 16, 16]} />
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
        const pos = m.startPos.clone().addScaledVector(m.direction, progress);
        mesh.position.copy(pos);
        mesh.lookAt(pos.clone().add(m.direction));
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
      ref.current.uniforms.uColor.value.lerp(new THREE.Color(preset.gridColor), 0.03);
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <planeGeometry args={[200, 200, 200, 200]} />
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
      matRef.current.color.lerp(new THREE.Color(preset.particleColor), 0.03);
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

/* ── Street Furniture: lamps, trees, benches ── */
function StreetLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 1.6, 6]} />
        <meshPhysicalMaterial color="#333333" roughness={0.4} metalness={0.8} />
      </mesh>
      <mesh position={[0.15, 1.5, 0]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 4]} />
        <meshPhysicalMaterial color="#333333" roughness={0.4} metalness={0.8} />
      </mesh>
      <mesh position={[0.25, 1.55, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ffeecc" emissive="#ffdd88" emissiveIntensity={2} />
      </mesh>
      <pointLight position={[0.25, 1.55, 0]} intensity={0.3} color="#ffdd88" distance={5} />
    </group>
  );
}

function LowPolyTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.6, 5]} />
        <meshStandardMaterial color="#5a3a20" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <coneGeometry args={[0.25, 0.5, 6]} />
        <meshStandardMaterial color="#1a5a2a" emissive="#0a2a0a" emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <coneGeometry args={[0.2, 0.4, 6]} />
        <meshStandardMaterial color="#226633" emissive="#0a2a0a" emissiveIntensity={0.1} />
      </mesh>
    </group>
  );
}

function StreetBench({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.5, 0.04, 0.15]} />
        <meshPhysicalMaterial color="#5a3a1a" roughness={0.8} metalness={0.1} />
      </mesh>
      {[-0.2, 0.2].map((x) => (
        <mesh key={x} position={[x, 0.07, 0]}>
          <boxGeometry args={[0.03, 0.14, 0.12]} />
          <meshPhysicalMaterial color="#444" roughness={0.5} metalness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 0.28, -0.06]}>
        <boxGeometry args={[0.5, 0.15, 0.02]} />
        <meshPhysicalMaterial color="#5a3a1a" roughness={0.8} metalness={0.1} />
      </mesh>
    </group>
  );
}

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

  return (
    <group>
      {items.lamps.map((pos, i) => <StreetLamp key={`lamp-${i}`} position={pos} />)}
      {items.trees.map((t, i) => <LowPolyTree key={`tree-${i}`} position={t.pos} scale={t.scale} />)}
      {items.benches.map((b, i) => <StreetBench key={`bench-${i}`} position={b.pos} rotation={b.rot} />)}
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
        width={512}
        height={512}
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

/* ── Main City export ── */
export default function City({ buildings, onBuildingClick, onIntroComplete, focusPosition }: CityProps) {
  const [introComplete, setIntroComplete] = useState(false);
  const [time, setTime] = useState<TimeOfDay>('night');
  const orbitRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
    onIntroComplete?.();
  }, [onIntroComplete]);

  const preset = TIME_PRESETS[time];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Time-of-day toggle UI */}
      <div style={{
        position: 'absolute',
        top: 60,
        right: 16,
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}>
        {([
          { key: 'night', icon: '🌙', label: 'Night' },
          { key: 'dawn', icon: '🌅', label: 'Dawn' },
          { key: 'day', icon: '☀️', label: 'Day' },
          { key: 'sunset', icon: '🌇', label: 'Sunset' },
        ] as const).map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => setTime(key)}
            title={label}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: time === key ? '2px solid rgba(29,185,84,0.8)' : '1px solid rgba(255,255,255,0.1)',
              background: time === key ? 'rgba(29,185,84,0.15)' : 'rgba(8,9,10,0.7)',
              backdropFilter: 'blur(10px)',
              cursor: 'pointer',
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: time === key ? '0 0 12px rgba(29,185,84,0.3)' : 'none',
            }}
          >
            {icon}
          </button>
        ))}
      </div>

      <Canvas
        camera={{ position: [80, 50, 80], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      >
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
        <StreetFurniture buildings={buildings} />

        {buildings.map((b, i) => (
          <Building key={b.profile.id || i} params={b} onClick={onBuildingClick} />
        ))}

        {!introComplete && <CinematicIntro onComplete={handleIntroComplete} />}
        <SmartOrbitControls enabled={introComplete} orbitRef={orbitRef} />

        <AnimatedBloom time={time} />
      </Canvas>
    </div>
  );
}
