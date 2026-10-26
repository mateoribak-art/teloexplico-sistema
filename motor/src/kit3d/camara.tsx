import React, { useLayoutEffect } from "react";
import { useCurrentFrame } from "remotion";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

// Cámara por "tomas": cada toma es una pose (dónde está y adónde mira) en un frame.
// Entre dos tomas la cámara viaja con aceleración y frenado suaves; para quedarse quieta,
// se repite la misma pose en dos frames. Nunca se usa useFrame: todo sale del frame de Remotion.

export type V3 = [number, number, number];
export type Toma = { f: number; pos: V3; mira: V3; fov?: number };

const suave = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const mezcla = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** Pose de la cámara en un frame (también sirve afuera del canvas, p. ej. para orientar un corte). */
export const poseEn = (tomas: Toma[], frame: number, fovBase = 28) => {
  if (frame <= tomas[0].f) return { pos: tomas[0].pos, mira: tomas[0].mira, fov: tomas[0].fov ?? fovBase };
  for (let i = 0; i < tomas.length - 1; i++) {
    const a = tomas[i];
    const b = tomas[i + 1];
    if (frame <= b.f) {
      const t = suave((frame - a.f) / Math.max(1, b.f - a.f));
      return { pos: mezcla(a.pos, b.pos, t), mira: mezcla(a.mira, b.mira, t), fov: (a.fov ?? fovBase) + ((b.fov ?? fovBase) - (a.fov ?? fovBase)) * t };
    }
  }
  const u = tomas[tomas.length - 1];
  return { pos: u.pos, mira: u.mira, fov: u.fov ?? fovBase };
};

/** Gira un punto alrededor del eje vertical que pasa por `centro` (para órbitas lentas). */
export const orbitar = (pos: V3, centro: V3, angulo: number): V3 => {
  const dx = pos[0] - centro[0];
  const dz = pos[2] - centro[2];
  const c = Math.cos(angulo);
  const s = Math.sin(angulo);
  return [centro[0] + dx * c + dz * s, pos[1], centro[2] - dx * s + dz * c];
};

export const Camara: React.FC<{ tomas: Toma[]; deriva?: number }> = ({ tomas, deriva = 0.0012 }) => {
  const frame = useCurrentFrame();
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const invalidate = useThree((s) => s.invalidate);
  useLayoutEffect(() => {
    const p = poseEn(tomas, frame);
    // deriva: una órbita mínima constante para que nunca quede congelada
    const pos = orbitar(p.pos, p.mira, Math.sin(frame * deriva * 6) * 0.04);
    camera.position.set(...pos);
    camera.fov = p.fov;
    camera.updateProjectionMatrix();
    camera.lookAt(new THREE.Vector3(...p.mira));
    invalidate();
  }, [frame, tomas, camera, deriva, invalidate]);
  return null;
};
