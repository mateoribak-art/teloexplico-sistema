import React from "react";

// Filas de súper vistas desde arriba en perspectiva: 3 cajas.
// modo 0 = una fila por caja (el cliente lento de la caja 0 frena a los de atrás);
// modo 1 = una sola fila que alimenta la primera caja libre.
// Todo sale del estado: `t` es el tiempo de la simulación en "turnos" (no frames). Piso en y = 0.

export type EstadoFilas = {
  t: number; // tiempo de simulación
  modo: 0 | 1;
  aparece: number; // 0..1
  sombra?: number; // 0..1 resalta al cliente lento
  tu?: boolean; // se dibuja al cliente dorado ("vos")
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const suave = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};

const CAJA_X = [-2.4, 0, 2.4];
const PASO = 0.95; // distancia entre clientes en la fila
const Z0 = 0.9; // primer lugar de la fila (frente a la caja)
const DUR_PASO = 0.45; // lo que tarda en avanzar un lugar

// cliente: caja (modo 0), duración de atención; los primeros de cada fila
type Cliente = { id: number; caja: number; dur: number; lento: boolean; tu: boolean; color: string };
const COLORES = ["#8fb8ff", "#f08fb8", "#8fe0b0", "#c9a8ff", "#ffb48f", "#7fd6e0"];
const DURS: number[][] = [
  [4.0, 1.0, 1.0, 1.0],
  [1.0, 1.0, 1.0, 1.0],
  [1.0, 1.2, 1.0, 1.0],
];
const CLIENTES: Cliente[] = [];
{
  let id = 0;
  for (let l = 0; l < 3; l++)
    for (let j = 0; j < 4; j++) {
      CLIENTES.push({
        id: id++,
        caja: l,
        dur: DURS[l][j],
        lento: l === 0 && j === 0,
        tu: l === 0 && j === 2,
        color: COLORES[(l * 4 + j) % COLORES.length],
      });
    }
}

type Plan = { inicio: number; fin: number; caja: number };

// modo 0: cada fila se atiende en orden en su caja
const planSeparado = (): Plan[] => {
  const planes: Plan[] = [];
  const libre = [0, 0, 0];
  for (const c of CLIENTES) {
    const inicio = libre[c.caja];
    planes[c.id] = { inicio, fin: inicio + c.dur, caja: c.caja };
    libre[c.caja] = inicio + c.dur;
  }
  return planes;
};

// modo 1: una fila única; orden de llegada intercalado (primero los de adelante de cada fila), caja libre más temprana
const planUnico = (): { planes: Plan[]; orden: number[] } => {
  const orden: number[] = [];
  for (let j = 0; j < 4; j++) for (let l = 0; l < 3; l++) orden.push(l * 4 + j);
  const libre = [0, 0, 0];
  const planes: Plan[] = [];
  for (const id of orden) {
    let c = 0;
    for (let i = 1; i < 3; i++) if (libre[i] < libre[c]) c = i;
    const inicio = libre[c];
    planes[id] = { inicio, fin: inicio + CLIENTES[id].dur, caja: c };
    libre[c] = inicio + CLIENTES[id].dur;
  }
  return { planes, orden };
};

const SEP = planSeparado();
const UNI = planUnico();

const Persona: React.FC<{ c: Cliente; x: number; z: number; esc: number; sombra: number; tu: boolean }> = ({ c, x, z, esc, sombra, tu }) => {
  const color = tu ? "#ffd23f" : c.color;
  const lento = c.lento;
  return (
    <group position={[x, 0, z]} scale={[esc, esc, esc]}>
      {/* cuerpo */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.3, 0.84, 20]} />
        <meshStandardMaterial color={color} roughness={0.55} emissive={tu ? "#ffd23f" : "#000000"} emissiveIntensity={tu ? 0.25 : 0} />
      </mesh>
      {/* cabeza */}
      <mesh position={[0, 1.02, 0]} castShadow>
        <sphereGeometry args={[0.2, 20, 16]} />
        <meshStandardMaterial color="#f2d2b8" roughness={0.6} />
      </mesh>
      {/* carrito: el lento lo trae lleno */}
      <group position={[0, 0, 0.5]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.55, 0.3, 0.45]} />
          <meshStandardMaterial color="#cfd6e4" roughness={0.4} metalness={0.5} />
        </mesh>
        {lento && (
          <>
            {[-0.15, 0.15].map((dx, i) => (
              <mesh key={i} position={[dx, 0.6 + i * 0.08, 0]} castShadow>
                <boxGeometry args={[0.24, 0.32 + i * 0.1, 0.34]} />
                <meshStandardMaterial color={i ? "#ff7a59" : "#59c3ff"} roughness={0.6} />
              </mesh>
            ))}
            <mesh position={[0, 0.88, 0]} castShadow>
              <boxGeometry args={[0.4, 0.22, 0.34]} />
              <meshStandardMaterial color="#ffd23f" roughness={0.6} />
            </mesh>
          </>
        )}
      </group>
      {lento && sombra > 0.02 && (
        <mesh position={[0, 0.03, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.7, 0.9, 40]} />
          <meshStandardMaterial color="#ff4d4d" emissive="#ff4d4d" emissiveIntensity={1.2 * sombra} transparent opacity={0.9 * sombra} />
        </mesh>
      )}
    </group>
  );
};

const Caja: React.FC<{ x: number }> = ({ x }) => (
  <group position={[x, 0, 0]}>
    <mesh position={[0, 0.35, -0.55]} castShadow receiveShadow>
      <boxGeometry args={[1.5, 0.7, 0.9]} />
      <meshStandardMaterial color="#2c3a5e" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.74, -0.55]}>
      <boxGeometry args={[1.5, 0.06, 0.9]} />
      <meshStandardMaterial color="#8ea4d8" roughness={0.3} metalness={0.4} />
    </mesh>
    {/* pantalla de la caja */}
    <mesh position={[0, 1.0, -0.8]} rotation={[-0.3, 0, 0]}>
      <boxGeometry args={[0.5, 0.35, 0.05]} />
      <meshStandardMaterial color="#10162a" emissive="#5fd2ff" emissiveIntensity={0.5} />
    </mesh>
  </group>
);

export const Filas: React.FC<{ e: EstadoFilas }> = ({ e }) => {
  const ap = clamp01(e.aparece);
  const planes = e.modo === 0 ? SEP : UNI.planes;
  const ordenUnico = UNI.orden;
  return (
    <group scale={[ap, ap, ap]}>
      {CAJA_X.map((x, i) => (
        <Caja key={i} x={x} />
      ))}
      {CLIENTES.map((c) => {
        const p = planes[c.id];
        const t = e.t;
        // salida: se va hacia la derecha después de terminar
        const sale = suave((t - p.fin) / 0.5);
        if (sale >= 1) return null;
        const cajaX = CAJA_X[p.caja];
        let x: number;
        let z: number;
        if (e.modo === 0) {
          // lugar en la fila: cuántos de los de adelante siguen sin terminar
          let lugar = 0;
          for (const o of CLIENTES) {
            if (o.caja !== c.caja) continue;
            if (o.id >= c.id) continue;
            lugar += 1 - suave((t - SEP[o.id].fin) / DUR_PASO);
          }
          x = cajaX;
          z = Z0 + lugar * PASO;
        } else {
          // fila única: esperan en el centro, de a uno; cuando les toca, caminan a la caja libre
          const antes = ordenUnico.indexOf(c.id);
          let lugar = 0;
          for (let q = 0; q < antes; q++) lugar += 1 - suave((t - UNI.planes[ordenUnico[q]].inicio) / DUR_PASO);
          const ir = suave((t - p.inicio + 0.35) / 0.35);
          const xFila = 0;
          const zFila = 3.9 + lugar * PASO - (3 - Math.min(3, ordenUnico.length)) * 0;
          x = xFila + (cajaX - xFila) * ir;
          z = zFila + (Z0 - zFila) * ir;
        }
        const tu = !!e.tu && c.tu;
        const esc = 1;
        return (
          <Persona key={c.id} c={c} x={x + sale * 4} z={z} esc={esc} sombra={e.sombra ?? 0} tu={tu} />
        );
      })}
    </group>
  );
};
