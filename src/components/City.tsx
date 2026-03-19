'use client';

import { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import Building from './Building';
import { BuildingParams } from '@/types';

interface CityProps {
  buildings: BuildingParams[];
  onBuildingClick: (params: BuildingParams) => void;
  onIntroComplete?: () => void;
  focusPosition?: [number, number, number] | null;
}

function DarkGround() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#0a0a12" roughness={0.9} metalness={0.1} />
    </mesh>
  );
}

function SkyDome() {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {},
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition).y;
          vec3 horizonColor = vec3(0.04, 0.04, 0.12);
          vec3 zenithColor = vec3(0.01, 0.01, 0.02);
          float t = clamp(h, 0.0, 1.0);
          t = pow(t, 0.6);
          vec3 color = mix(horizonColor, zenithColor, t);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }, []);

  return (
    <mesh material={material}>
      <sphereGeometry args={[150, 32, 16]} />
    </mesh>
  );
}

function ShootingStars() {
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

function AnimatedGrid({ buildings }: { buildings: BuildingParams[] }) {
  const ref = useRef<THREE.ShaderMaterial>(null);

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

function FloatingParticles() {
  const count = 80;
  const ref = useRef<THREE.Points>(null);

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
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial color="#1DB954" size={0.4} transparent opacity={0.85} sizeAttenuation />
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

const DEFAULT_CAM_POS: [number, number, number] = [30, 16, 30];

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

export default function City({ buildings, onBuildingClick, onIntroComplete, focusPosition }: CityProps) {
  const [introComplete, setIntroComplete] = useState(false);
  const orbitRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
    onIntroComplete?.();
  }, [onIntroComplete]);

  return (
    <Canvas
      camera={{ position: [80, 50, 80], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
    >
      <SkyDome />
      <fog attach="fog" args={['#0a0a1e', 25, 85]} />

      <ambientLight intensity={0.15} />
      <hemisphereLight args={['#1a1a3a', '#080810', 0.15]} />
      <directionalLight position={[15, 25, 10]} intensity={0.5} color="#e8e0ff" />
      <pointLight position={[0, 20, 0]} intensity={0.4} color="#1DB954" distance={60} />
      <pointLight position={[-20, 8, -20]} intensity={0.3} color="#4169E1" distance={40} />
      <pointLight position={[20, 8, 20]} intensity={0.3} color="#FF69B4" distance={40} />

      <Stars radius={120} depth={60} count={1500} factor={5} fade speed={0.3} />
      <ShootingStars />

      <DarkGround />
      <AnimatedGrid buildings={buildings} />
      <FloatingParticles />
      <DustParticles />

      {buildings.map((b, i) => (
        <Building key={b.profile.id || i} params={b} onClick={onBuildingClick} />
      ))}

      {!introComplete && <CinematicIntro onComplete={handleIntroComplete} />}
      <SmartOrbitControls enabled={introComplete} orbitRef={orbitRef} />

      <EffectComposer>
        <Bloom
          intensity={1.4}
          luminanceThreshold={0.3}
          luminanceSmoothing={0.4}
          mipmapBlur
          width={512}
          height={512}
        />
      </EffectComposer>
    </Canvas>
  );
}
