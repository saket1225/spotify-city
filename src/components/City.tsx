'use client';

import { useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import Building from './Building';
import { BuildingParams } from '@/types';

interface CityProps {
  buildings: BuildingParams[];
  onBuildingClick: (params: BuildingParams) => void;
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#080808" roughness={0.95} metalness={0.05} />
    </mesh>
  );
}

function AnimatedGrid() {
  const ref = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#1DB954') },
  }), []);

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
          varying vec2 vUv;
          varying vec3 vPos;
          void main() {
            vec2 grid = abs(fract(vPos.xy * 0.1) - 0.5);
            float line = min(grid.x, grid.y);
            float gridLine = 1.0 - smoothstep(0.0, 0.02, line);

            float dist = length(vPos.xy);
            float pulse = sin(dist * 0.08 - uTime * 0.8) * 0.5 + 0.5;
            float fade = 1.0 - smoothstep(0.0, 80.0, dist);

            float alpha = gridLine * fade * (0.08 + pulse * 0.06);
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
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = Math.random() * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
      spd[i] = 0.02 + Math.random() * 0.04;
    }
    return [pos, spd];
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const posAttr = ref.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i];
      if (arr[i * 3 + 1] > 35) {
        arr[i * 3 + 1] = 0;
        arr[i * 3] = (Math.random() - 0.5) * 60;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 60;
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
        size={0.12}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function AudioWavePlane() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const geo = ref.current.geometry as THREE.PlaneGeometry;
    const pos = geo.attributes.position;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const dist = Math.sqrt(x * x + y * y);
      const wave = Math.sin(dist * 0.3 - t * 1.5) * 0.15 *
                   Math.max(0, 1 - dist / 40);
      pos.setZ(i, wave);
    }
    pos.needsUpdate = true;
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      <planeGeometry args={[80, 80, 60, 60]} />
      <meshBasicMaterial color="#1DB954" wireframe transparent opacity={0.03} />
    </mesh>
  );
}

function SmartOrbitControls() {
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  const autoRotateRef = useRef(true);

  const handleInteraction = useCallback(() => {
    autoRotateRef.current = false;
    if (controlsRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (controlsRef.current as any).autoRotate = false;
    }
  }, []);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      minDistance={8}
      maxDistance={65}
      maxPolarAngle={Math.PI / 2.15}
      autoRotate
      autoRotateSpeed={0.3}
      onStart={handleInteraction}
    />
  );
}

export default function City({ buildings, onBuildingClick }: CityProps) {
  return (
    <Canvas
      camera={{ position: [40, 30, 40], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
      shadows
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
    >
      <color attach="background" args={['#050510']} />
      <fog attach="fog" args={['#050510', 40, 100]} />

      <ambientLight intensity={0.25} />
      <directionalLight
        position={[15, 25, 10]}
        intensity={0.6}
        color="#e8e0ff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 20, 0]} intensity={0.4} color="#1DB954" distance={60} />
      <pointLight position={[-20, 8, -20]} intensity={0.2} color="#4169E1" distance={40} />
      <pointLight position={[20, 8, 20]} intensity={0.2} color="#FF69B4" distance={40} />

      <Stars radius={120} depth={60} count={3000} factor={5} fade speed={0.3} />

      <Ground />
      <AnimatedGrid />
      <AudioWavePlane />
      <FloatingParticles />

      {buildings.map((b, i) => (
        <Building key={b.profile.id || i} params={b} onClick={onBuildingClick} />
      ))}

      <SmartOrbitControls />

      <EffectComposer>
        <Bloom
          intensity={0.8}
          luminanceThreshold={0.6}
          luminanceSmoothing={0.3}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
