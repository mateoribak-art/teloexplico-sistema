import React, { useMemo } from "react";
import { random } from "remotion";
import { CalorCuerpo } from "./CalorCuerpo";

// Persona (sin cara) con gotas que caen del pelo mojado y virus (bolitas con púas) que flotan alrededor.
// Mira a +z, piso en y = 0, mide ~3. Todo sale del frame.

export type EstadoPeloMojado = {
  frame: number;
  gotas: number; // 0..1 gotas cayendo del pelo
  virus: number; // 0..1 cuántos virus se ven
  acerca: number; // 0..1 los virus se acercan a la cara
  frio: number; // 0..1 tinte azul de la piel
  campera: number; // 0..1
};

const N_VIRUS = 14;

const Virus: React.FC<{ p: [number, number, number]; s: number; op: number }> = ({ p, s, op }) => {
  const puas = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        const b = (i % 2 ? 1 : -1) * 0.7;
        return [Math.cos(a) * Math.cos(b), Math.sin(b), Math.sin(a) * Math.cos(b)] as [number, number, number];
      }),
    []
  );
  return (
    <group position={p} scale={s}>
      <mesh>
        <sphereGeometry args={[0.1, 14, 12]} />
        <meshBasicMaterial color="#ff5a6a" transparent opacity={op} depthWrite={false} />
      </mesh>
      {puas.map((d, i) => (
        <mesh key={i} position={[d[0] * 0.13, d[1] * 0.13, d[2] * 0.13]}>
          <sphereGeometry args={[0.03, 8, 6]} />
          <meshBasicMaterial color="#ff8a96" transparent opacity={op} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
};

export const PeloMojado: React.FC<{ e: EstadoPeloMojado }> = ({ e }) => {
  const f = e.frame;
  const gotas = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        x: (random(`gx${i}`) - 0.5) * 0.5,
        z: (random(`gz${i}`) - 0.3) * 0.4,
        fase: random(`gf${i}`),
        vel: 0.02 + random(`gv${i}`) * 0.012,
      })),
    []
  );
  const virus = useMemo(
    () =>
      Array.from({ length: N_VIRUS }, (_, i) => ({
        a: (i / N_VIRUS) * Math.PI * 2 + random(`va${i}`),
        r: 1.0 + random(`vr${i}`) * 0.9,
        y: 1.3 + random(`vy${i}`) * 1.6,
        w: 0.01 + random(`vw${i}`) * 0.012,
      })),
    []
  );
  return (
    <group>
      <CalorCuerpo e={{ frame: f, calor: 0, foco: 0, gorro: 0, campera: e.campera, frio: e.frio, pantalon: 0 }} />
      {/* pelo mojado: brillo azulado */}
      {e.gotas > 0.01 && (
        <mesh position={[0, 2.6, -0.04]} scale={[1.01, 0.81, 1.01]}>
          <sphereGeometry args={[0.29, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshBasicMaterial color="#5ec8ff" transparent opacity={0.25 * e.gotas} depthWrite={false} />
        </mesh>
      )}
      {gotas.map((g, i) => {
        const t = (f * g.vel + g.fase) % 1;
        const op = e.gotas * Math.sin(Math.PI * Math.min(1, t * 1.15));
        if (op <= 0.03) return null;
        return (
          <mesh key={i} position={[g.x, 2.7 - t * 1.5, g.z + 0.15]} scale={[0.7, 1.3, 0.7]}>
            <sphereGeometry args={[0.04, 10, 8]} />
            <meshBasicMaterial color="#5ec8ff" transparent opacity={0.9 * op} depthWrite={false} />
          </mesh>
        );
      })}
      {e.virus > 0.01 &&
        virus.map((v, i) => {
          if (i / N_VIRUS > e.virus) return null;
          const ang = v.a + f * v.w;
          const r = v.r * (1 - 0.55 * e.acerca);
          const y = v.y + Math.sin(f / 14 + i) * 0.08 - (v.y - 2.5) * 0.4 * e.acerca;
          return <Virus key={i} p={[Math.cos(ang) * r, y, Math.sin(ang) * r * 0.8 + 0.3]} s={1 + 0.2 * Math.sin(f / 9 + i)} op={0.95} />;
        })}
    </group>
  );
};
