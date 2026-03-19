'use client';

import { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import Building from './Building';
import { BuildingParams } from '@/types';
import { GENRE_DISTRICTS } from '@/lib/buildingGenerator';

interface CityProps {
  buildings: BuildingParams[];
  onBuildingClick: (params: BuildingParams) => void;
  onIntroComplete?: () => void;
  focusPosition?: [number, number, number] | null;
  controlsRef?: React.MutableRefObject<{ rotate: (dx: number, dy: number) => void; reset: () => void } | null>;
}

function DarkGround() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#0a0a12" roughness={0.9} metalness={0.1} />
    </mesh>
  );
}

// Gradient sky dome: dark blue at horizon fading to black at top
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

// Shooting stars / meteors traversing the sky every 5-10 seconds
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
        <mesh
          key={`meteor-${i}`}
          ref={(el) => { meshRefs.current[i] = el; }}
          visible={false}
        >
          <boxGeometry args={[0.05, 0.05, 3]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
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

// Sonar/radar pulse rings emanating from genre district centers
function DistrictPulses() {
  const ref = useRef<THREE.ShaderMaterial>(null);

  const districtData = useMemo(() => {
    const centers = new Float32Array(GENRE_DISTRICTS.length * 2);
    const radii = new Float32Array(GENRE_DISTRICTS.length);
    for (let i = 0; i < GENRE_DISTRICTS.length; i++) {
      centers[i * 2] = GENRE_DISTRICTS[i].center[0];
      centers[i * 2 + 1] = GENRE_DISTRICTS[i].center[1];
      radii[i] = GENRE_DISTRICTS[i].radius;
    }
    return { centers, radii, count: GENRE_DISTRICTS.length };
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#1DB954') },
    uCenters: { value: districtData.centers },
    uRadii: { value: districtData.radii },
    uCount: { value: districtData.count },
  }), [districtData]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
      <planeGeometry args={[200, 200, 1, 1]} />
      <shaderMaterial
        ref={ref}
        transparent
        depthWrite={false}
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
          uniform float uCenters[12];
          uniform float uRadii[6];
          uniform int uCount;
          varying vec2 vUv;
          varying vec3 vPos;
          void main() {
            float alpha = 0.0;
            for (int i = 0; i < 6; i++) {
              if (i >= uCount) break;
              vec2 center = vec2(uCenters[i * 2], uCenters[i * 2 + 1]);
              float maxR = uRadii[i];
              float dist = length(vPos.xy - center);

              for (int ring = 0; ring < 2; ring++) {
                float offset = float(ring) * 0.5;
                float expandT = fract(uTime * 0.08 + offset + float(i) * 0.15);
                float ringRadius = expandT * maxR;
                float ringWidth = 0.3;
                float ringAlpha = smoothstep(ringWidth, 0.0, abs(dist - ringRadius));
                ringAlpha *= (1.0 - expandT) * 0.12;
                alpha += ringAlpha;
              }
            }
            alpha = min(alpha, 0.15);
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
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#1DB954"
        size={0.4}
        transparent
        opacity={0.85}
        sizeAttenuation
      />
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
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#8888ff"
        size={0.12}
        transparent
        opacity={0.35}
        sizeAttenuation
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

// Camera focus animation - smoothly moves camera to orbit a target position
function CameraFocus({ target, controlsRef }: { target: [number, number, number] | null; controlsRef: React.MutableRefObject<React.ComponentRef<typeof OrbitControls> | null> }) {
  const { camera } = useThree();
  const animatingRef = useRef(false);
  const startTimeRef = useRef(0);
  const startPosRef = useRef(new THREE.Vector3());
  const targetPosRef = useRef(new THREE.Vector3());
  const startTargetRef = useRef(new THREE.Vector3());
  const endTargetRef = useRef(new THREE.Vector3());
  const prevTargetRef = useRef<[number, number, number] | null>(null);

  useEffect(() => {
    if (!target || (prevTargetRef.current && prevTargetRef.current[0] === target[0] && prevTargetRef.current[2] === target[2])) return;
    prevTargetRef.current = target;

    const bldgPos = new THREE.Vector3(target[0], target[1], target[2]);
    const angle = Math.atan2(camera.position.z - bldgPos.z, camera.position.x - bldgPos.x);
    const elevation = Math.PI / 5;
    const dist = 15;

    const camTarget = new THREE.Vector3(
      bldgPos.x + Math.cos(angle) * Math.cos(elevation) * dist,
      bldgPos.y + Math.sin(elevation) * dist,
      bldgPos.z + Math.sin(angle) * Math.cos(elevation) * dist
    );

    startPosRef.current.copy(camera.position);
    targetPosRef.current.copy(camTarget);
    startTargetRef.current.set(0, 0, 0);
    if (controlsRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ctrl = controlsRef.current as any;
      if (ctrl.target) startTargetRef.current.copy(ctrl.target);
    }
    endTargetRef.current.copy(bldgPos);
    endTargetRef.current.y = target[1] + 3;

    animatingRef.current = true;
    startTimeRef.current = -1;
  }, [target, camera, controlsRef]);

  useFrame((state) => {
    if (!animatingRef.current) return;

    if (startTimeRef.current < 0) startTimeRef.current = state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - startTimeRef.current;
    const duration = 1.0;
    const t = Math.min(elapsed / duration, 1);

    const eased = 1 - Math.pow(1 - t, 3);

    camera.position.lerpVectors(startPosRef.current, targetPosRef.current, eased);

    if (controlsRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ctrl = controlsRef.current as any;
      if (ctrl.target) {
        ctrl.target.lerpVectors(startTargetRef.current, endTargetRef.current, eased);
      }
    }

    if (t >= 1) {
      animatingRef.current = false;
    }
  });

  return null;
}

const DEFAULT_CAM_POS: [number, number, number] = [30, 16, 30];

function SmartOrbitControls({ enabled = true, orbitRef, externalControlsRef }: {
  enabled?: boolean;
  orbitRef: React.MutableRefObject<React.ComponentRef<typeof OrbitControls> | null>;
  externalControlsRef?: React.MutableRefObject<{ rotate: (dx: number, dy: number) => void; reset: () => void } | null>;
}) {
  const autoRotateRef = useRef(true);
  const { camera } = useThree();

  const handleInteraction = useCallback(() => {
    autoRotateRef.current = false;
    if (orbitRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (orbitRef.current as any).autoRotate = false;
    }
  }, [orbitRef]);

  useEffect(() => {
    if (!externalControlsRef) return;
    externalControlsRef.current = {
      rotate: (dx: number, dy: number) => {
        if (!orbitRef.current) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ctrl = orbitRef.current as any;
        if (ctrl.getAzimuthalAngle && ctrl.getPolarAngle) {
          const azimuth = ctrl.getAzimuthalAngle() + dx;
          const polar = Math.max(0.1, Math.min(Math.PI / 2.05, ctrl.getPolarAngle() + dy));
          const distance = camera.position.distanceTo(ctrl.target);
          camera.position.set(
            ctrl.target.x + distance * Math.sin(polar) * Math.cos(azimuth),
            ctrl.target.y + distance * Math.cos(polar),
            ctrl.target.z + distance * Math.sin(polar) * Math.sin(azimuth)
          );
          ctrl.update();
        }
        autoRotateRef.current = false;
        ctrl.autoRotate = false;
      },
      reset: () => {
        if (!orbitRef.current) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ctrl = orbitRef.current as any;
        camera.position.set(...DEFAULT_CAM_POS);
        if (ctrl.target) ctrl.target.set(0, 0, 0);
        ctrl.update();
      },
    };
  }, [externalControlsRef, orbitRef, camera]);

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

function DistrictLabels() {
  return (
    <>
      {GENRE_DISTRICTS.map((district) => (
        <Html
          key={district.name}
          position={[district.center[0], 15, district.center[1]]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div style={{
            color: 'rgba(29, 185, 84, 0.55)',
            fontFamily: '"Press Start 2P", "Courier New", monospace',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.25em',
            textShadow: '0 0 12px rgba(29, 185, 84, 0.3)',
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}>
            {district.label}
          </div>
        </Html>
      ))}
    </>
  );
}

export default function City({ buildings, onBuildingClick, onIntroComplete, focusPosition, controlsRef: externalControlsRef }: CityProps) {
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
      {/* Gradient sky dome instead of flat color */}
      <SkyDome />
      <fog attach="fog" args={['#0a0a1e', 25, 85]} />

      <ambientLight intensity={0.15} />
      <hemisphereLight args={['#1a1a3a', '#080810', 0.15]} />
      <directionalLight
        position={[15, 25, 10]}
        intensity={0.5}
        color="#e8e0ff"
      />
      <pointLight position={[0, 20, 0]} intensity={0.4} color="#1DB954" distance={60} />
      <pointLight position={[-20, 8, -20]} intensity={0.3} color="#4169E1" distance={40} />
      <pointLight position={[20, 8, 20]} intensity={0.3} color="#FF69B4" distance={40} />

      <Stars radius={120} depth={60} count={1500} factor={5} fade speed={0.3} />
      <ShootingStars />

      <DarkGround />
      <AnimatedGrid buildings={buildings} />
      <DistrictPulses />
      <FloatingParticles />
      <DustParticles />

      {buildings.map((b, i) => (
        <Building key={b.profile.id || i} params={b} onClick={onBuildingClick} />
      ))}

      <DistrictLabels />

      {!introComplete && <CinematicIntro onComplete={handleIntroComplete} />}
      <SmartOrbitControls enabled={introComplete} orbitRef={orbitRef} externalControlsRef={externalControlsRef} />
      <CameraFocus target={focusPosition ?? null} controlsRef={orbitRef} />

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
