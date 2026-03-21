'use client';
import { useRef, useMemo, useCallback, useEffect } from 'react';
import { useThree, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { CityData } from '@/types';

const CHUNK_SIZE = 64;

interface Props {
  cityData: CityData;
  onBuildingClick: (index: number) => void;
}

// 6 genre geometries - simple but distinct silhouettes
function createGenreGeometries(): THREE.BufferGeometry[] {
  return [
    new THREE.CylinderGeometry(0.5, 0.5, 1, 8),       // pop - cylinder
    new THREE.BoxGeometry(1, 1, 1),                     // rock - box
    new THREE.BoxGeometry(1, 1, 0.8),                   // hiphop - wide box
    new THREE.OctahedronGeometry(0.6, 0),               // electronic - diamond
    (() => { // indie - box with roof
      const box = new THREE.BoxGeometry(1, 0.7, 1);
      box.translate(0, -0.15, 0);
      const roof = new THREE.ConeGeometry(0.7, 0.3, 4);
      roof.translate(0, 0.35, 0);
      return mergeGeometries([box, roof]);
    })(),
    (() => { // classical - cylinder with dome
      const cyl = new THREE.CylinderGeometry(0.45, 0.5, 0.8, 8);
      cyl.translate(0, -0.1, 0);
      const dome = new THREE.SphereGeometry(0.45, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2);
      dome.translate(0, 0.3, 0);
      return mergeGeometries([cyl, dome]);
    })(),
  ];
}

export default function InstancedCity({ cityData, onBuildingClick }: Props) {
  const { camera, gl } = useThree();
  const meshRefs = useRef<(THREE.InstancedMesh | null)[]>([]);
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  // Build spatial index
  const spatialIndex = useMemo(() => {
    const index = new Map<string, number[]>();
    for (let i = 0; i < cityData.count; i++) {
      const cx = Math.floor(cityData.positions[i * 3] / CHUNK_SIZE);
      const cz = Math.floor(cityData.positions[i * 3 + 2] / CHUNK_SIZE);
      const key = `${cx},${cz}`;
      if (!index.has(key)) index.set(key, []);
      index.get(key)!.push(i);
    }
    return index;
  }, [cityData]);

  // Count buildings per genre for InstancedMesh allocation
  const genreCounts = useMemo(() => {
    const counts = new Uint32Array(6);
    for (let i = 0; i < cityData.count; i++) counts[cityData.genreIndices[i]]++;
    return counts;
  }, [cityData]);

  // Per-genre index mapping: globalIndex -> genreLocalIndex
  const genreLocalIndices = useMemo(() => {
    const counters = new Uint32Array(6);
    const localIdx = new Uint32Array(cityData.count);
    for (let i = 0; i < cityData.count; i++) {
      const g = cityData.genreIndices[i];
      localIdx[i] = counters[g]++;
    }
    return localIdx;
  }, [cityData]);

  const geometries = useMemo(() => createGenreGeometries(), []);

  const materials = useMemo(
    () =>
      Array.from({ length: 6 }, () =>
        new THREE.MeshStandardMaterial({
          roughness: 0.5,
          metalness: 0.3,
        })
      ),
    []
  );

  // Initialize all instance matrices and colors
  useEffect(() => {
    for (let g = 0; g < 6; g++) {
      const mesh = meshRefs.current[g];
      if (!mesh) continue;
      for (let i = 0; i < cityData.count; i++) {
        if (cityData.genreIndices[i] !== g) continue;
        const li = genreLocalIndices[i];
        const w = cityData.scales[i * 3];
        const h = cityData.scales[i * 3 + 1];
        const d = cityData.scales[i * 3 + 2];
        tempMatrix.makeScale(w, h, d);
        tempMatrix.setPosition(
          cityData.positions[i * 3],
          h * 0.5,
          cityData.positions[i * 3 + 2]
        );
        mesh.setMatrixAt(li, tempMatrix);
        tempColor.setRGB(
          cityData.colors[i * 3],
          cityData.colors[i * 3 + 1],
          cityData.colors[i * 3 + 2]
        );
        mesh.setColorAt(li, tempColor);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  }, [cityData, genreLocalIndices, tempMatrix, tempColor]);

  // Click handler - raycast to ground plane, find nearest building
  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      const rect = gl.domElement.getBoundingClientRect();
      const clientX = e.clientX ?? 0;
      const clientY = e.clientY ?? 0;
      mouse.x = (clientX - rect.left) / rect.width * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      // Intersect with ground plane at y=0
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const point = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, point);
      if (!point) return;

      // Find nearest building within 5 units
      let nearest = -1;
      let nearestDist = 25; // 5^2
      const cx = Math.floor(point.x / CHUNK_SIZE);
      const cz = Math.floor(point.z / CHUNK_SIZE);
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          const buildings = spatialIndex.get(`${cx + dx},${cz + dz}`);
          if (!buildings) continue;
          for (const bi of buildings) {
            const bx = cityData.positions[bi * 3] - point.x;
            const bz = cityData.positions[bi * 3 + 2] - point.z;
            const d2 = bx * bx + bz * bz;
            if (d2 < nearestDist) {
              nearestDist = d2;
              nearest = bi;
            }
          }
        }
      }
      if (nearest >= 0) onBuildingClick(nearest);
    },
    [cityData, spatialIndex, camera, gl, onBuildingClick]
  );

  return (
    <group onClick={handleClick}>
      {geometries.map((geo, g) => (
        <instancedMesh
          key={g}
          ref={(el: THREE.InstancedMesh | null) => {
            meshRefs.current[g] = el;
          }}
          args={[geo, materials[g], genreCounts[g]]}
          frustumCulled={false}
        />
      ))}
      {/* Invisible ground for click detection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} visible={false}>
        <planeGeometry args={[3000, 3000]} />
        <meshBasicMaterial />
      </mesh>
    </group>
  );
}
