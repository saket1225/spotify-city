'use client';

import { useMemo } from 'react';
import { BuildingParams } from '@/types';

interface MinimapProps {
  buildings: BuildingParams[];
  cameraPosition: [number, number, number];
  cameraRotation: number; // Y rotation in radians
  onBuildingClick?: (building: BuildingParams) => void;
}

const MAP_SIZE = 140;
const WORLD_RANGE = 80; // world units visible on minimap

export default function Minimap({ buildings, cameraPosition, cameraRotation, onBuildingClick }: MinimapProps) {
  const worldToMap = (wx: number, wz: number): [number, number] => {
    const x = ((wx / WORLD_RANGE) * 0.5 + 0.5) * MAP_SIZE;
    const y = ((wz / WORLD_RANGE) * 0.5 + 0.5) * MAP_SIZE;
    return [x, y];
  };

  const camPos = worldToMap(cameraPosition[0], cameraPosition[2]);

  // Camera direction indicator
  const dirLen = 10;
  const dirX = camPos[0] + Math.sin(cameraRotation) * dirLen;
  const dirY = camPos[1] - Math.cos(cameraRotation) * dirLen;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        width: MAP_SIZE,
        height: MAP_SIZE,
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(8,9,10,0.8)',
        backdropFilter: 'blur(10px)',
        overflow: 'hidden',
        zIndex: 20,
      }}
    >
      <svg width={MAP_SIZE} height={MAP_SIZE} style={{ display: 'block' }}>
        {/* Grid */}
        {[0.25, 0.5, 0.75].map((t) => (
          <g key={t}>
            <line x1={t * MAP_SIZE} y1={0} x2={t * MAP_SIZE} y2={MAP_SIZE} stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} />
            <line x1={0} y1={t * MAP_SIZE} x2={MAP_SIZE} y2={t * MAP_SIZE} stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} />
          </g>
        ))}

        {/* Buildings */}
        {buildings.map((b, i) => {
          const [mx, my] = worldToMap(b.position[0], b.position[2]);
          const size = Math.max(3, Math.min(7, b.height / 4));
          return (
            <circle
              key={i}
              cx={mx}
              cy={my}
              r={size}
              fill={b.isCurrentUser ? '#1DB954' : b.primaryColor}
              opacity={b.isCurrentUser ? 0.9 : 0.5}
              style={{ cursor: 'pointer' }}
              onClick={() => onBuildingClick?.(b)}
            >
              <title>{b.profile.displayName}</title>
            </circle>
          );
        })}

        {/* Camera position */}
        <circle cx={camPos[0]} cy={camPos[1]} r={4} fill="white" opacity={0.9} />
        {/* Camera direction */}
        <line
          x1={camPos[0]} y1={camPos[1]}
          x2={dirX} y2={dirY}
          stroke="white" strokeWidth={1.5} opacity={0.7}
        />
        {/* Camera FOV cone */}
        <line
          x1={camPos[0]} y1={camPos[1]}
          x2={camPos[0] + Math.sin(cameraRotation - 0.4) * dirLen * 0.8}
          y2={camPos[1] - Math.cos(cameraRotation - 0.4) * dirLen * 0.8}
          stroke="white" strokeWidth={0.5} opacity={0.3}
        />
        <line
          x1={camPos[0]} y1={camPos[1]}
          x2={camPos[0] + Math.sin(cameraRotation + 0.4) * dirLen * 0.8}
          y2={camPos[1] - Math.cos(cameraRotation + 0.4) * dirLen * 0.8}
          stroke="white" strokeWidth={0.5} opacity={0.3}
        />
      </svg>
    </div>
  );
}
