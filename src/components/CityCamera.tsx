'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface ExploreCameraProps {
  enabled: boolean;
  flyTarget?: [number, number, number] | null;
  onFlyComplete?: () => void;
}

const MOVE_SPEED = 0.4;
const LOOK_SPEED = 0.002;
const VERTICAL_SPEED = 0.3;
const ZOOM_SPEED = 2;
const DAMPING = 0.9;
const MIN_Y = 1.5;
const MAX_Y = 60;

export default function ExploreCamera({ enabled, flyTarget, onFlyComplete }: ExploreCameraProps) {
  const { camera, gl } = useThree();
  const keysRef = useRef<Set<string>>(new Set());
  const velocityRef = useRef(new THREE.Vector3());
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const isDragging = useRef(false);
  const prevMouse = useRef({ x: 0, y: 0 });
  const flyingRef = useRef(false);
  const flyStartRef = useRef(new THREE.Vector3());
  const flyEndRef = useRef(new THREE.Vector3());
  const flyProgressRef = useRef(0);
  const flyCallbackRef = useRef(onFlyComplete);
  const initializedRef = useRef(false);
  flyCallbackRef.current = onFlyComplete;

  // Initialize euler from current camera when switching to explore mode
  useEffect(() => {
    if (enabled && !initializedRef.current) {
      const q = camera.quaternion;
      euler.current.setFromQuaternion(q, 'YXZ');
      initializedRef.current = true;
    }
    if (!enabled) {
      initializedRef.current = false;
    }
  }, [enabled, camera]);

  // Key handlers
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      keysRef.current.add(e.key.toLowerCase());
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      keysRef.current.clear();
    };
  }, [enabled]);

  // Mouse handlers
  useEffect(() => {
    if (!enabled) return;
    const dom = gl.domElement;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0 || e.button === 2) {
        isDragging.current = true;
        prevMouse.current = { x: e.clientX, y: e.clientY };
      }
    };
    const onMouseUp = () => { isDragging.current = false; };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - prevMouse.current.x;
      const dy = e.clientY - prevMouse.current.y;
      prevMouse.current = { x: e.clientX, y: e.clientY };

      euler.current.y -= dx * LOOK_SPEED;
      euler.current.x -= dy * LOOK_SPEED;
      euler.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, euler.current.x));
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -Math.sign(e.deltaY) * ZOOM_SPEED;
      velocityRef.current.y += delta;
    };
    const onContextMenu = (e: Event) => e.preventDefault();

    dom.addEventListener('mousedown', onMouseDown);
    dom.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('mousemove', onMouseMove);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('contextmenu', onContextMenu);

    return () => {
      dom.removeEventListener('mousedown', onMouseDown);
      dom.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('mousemove', onMouseMove);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('contextmenu', onContextMenu);
    };
  }, [enabled, gl.domElement]);

  // Fly-to
  useEffect(() => {
    if (!flyTarget || !enabled) return;
    flyingRef.current = true;
    flyStartRef.current.copy(camera.position);
    flyEndRef.current.set(flyTarget[0] + 5, Math.max(flyTarget[1] + 8, 6), flyTarget[2] + 5);
    flyProgressRef.current = 0;
  }, [flyTarget, enabled, camera]);

  useFrame(() => {
    if (!enabled) return;

    if (flyingRef.current) {
      flyProgressRef.current += 0.015;
      const t = flyProgressRef.current;
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      camera.position.lerpVectors(flyStartRef.current, flyEndRef.current, Math.min(eased, 1));

      const lookTarget = new THREE.Vector3(
        flyEndRef.current.x - 5,
        flyEndRef.current.y - 8,
        flyEndRef.current.z - 5
      );
      const dir = lookTarget.clone().sub(camera.position).normalize();
      euler.current.y = Math.atan2(-dir.x, -dir.z);
      euler.current.x = Math.asin(Math.max(-1, Math.min(1, dir.y)));

      if (t >= 1) {
        flyingRef.current = false;
        flyCallbackRef.current?.();
      }
      camera.quaternion.setFromEuler(euler.current);
      return;
    }

    // WASD movement
    const keys = keysRef.current;
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();

    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    const accel = new THREE.Vector3();

    if (keys.has('w') || keys.has('arrowup')) accel.add(forward);
    if (keys.has('s') || keys.has('arrowdown')) accel.sub(forward);
    if (keys.has('a') || keys.has('arrowleft')) accel.sub(right);
    if (keys.has('d') || keys.has('arrowright')) accel.add(right);
    if (keys.has(' ')) accel.y += VERTICAL_SPEED;
    if (keys.has('shift')) accel.y -= VERTICAL_SPEED;

    accel.multiplyScalar(MOVE_SPEED);
    velocityRef.current.add(accel);
    velocityRef.current.multiplyScalar(DAMPING);

    camera.position.add(velocityRef.current);
    camera.position.y = Math.max(MIN_Y, Math.min(MAX_Y, camera.position.y));

    camera.quaternion.setFromEuler(euler.current);
  });

  return null;
}
