import React from "react";

// Multitud: 100 personas en grilla de 10 x 10 (cada una = 1 % de la gente). Piso en y = 0.
// aparece 0..1: van apareciendo de a poco. oro 0..1: 10 se pintan de dorado (los diez apellidos más comunes).
// tres 0..1: 3 de esas 10 se agrandan (González, Rodríguez, Gómez). colores 0..1: el resto se vuelve de mil colores (apellidos distintos).

export type EstadoMultitud = {
  aparece: number;
  oro: number;
  tres: number;
  colores: number;
  frame: number;
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const suave = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};

const N = 10;
const PASO = 0.62;
const ORO = [3, 17, 24, 38, 45, 52, 66, 71, 85, 96]; // 10 lugares repartidos
const TRES = [17, 52, 85];
const PALETA = ["#e0502f", "#2f9fe0", "#4fc080", "#9a78e8", "#e0609a", "#3fb6c0", "#c9a060", "#7fb83a", "#e070b8", "#6f80e8"];
const GRIS = "#3f4f78";

const hex = (c: string) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const mezcla = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  const m = A.map((v, i) => Math.round(v + (B[i] - v) * t));
  return `rgb(${m[0]},${m[1]},${m[2]})`;
};

export const Multitud: React.FC<{ e: EstadoMultitud }> = ({ e }) => {
  const items: React.ReactNode[] = [];
  for (let i = 0; i < N * N; i++) {
    const fila = Math.floor(i / N);
    const col = i % N;
    const x = (col - (N - 1) / 2) * PASO;
    const z = (fila - (N - 1) / 2) * PASO;
    // aparición en orden de lectura con leve desfase
    const ap = suave(e.aparece * 1.6 - (i / (N * N)) * 0.6);
    if (ap <= 0.001) continue;
    const esOro = ORO.includes(i);
    const esTres = TRES.includes(i);
    let color: string;
    if (esOro) color = mezcla(GRIS, "#ffa800", suave(e.oro));
    else color = mezcla(GRIS, PALETA[(i * 7) % PALETA.length], suave(e.colores));
    const pulso = esTres ? 1 + 0.55 * suave(e.tres) + 0.04 * Math.sin(e.frame / 5) * suave(e.tres) : 1;
    const salto = esOro ? 0.12 * suave(e.oro) * (1 + Math.sin(e.frame / 6 + i)) * 0.5 : 0;
    const esc = ap * pulso * 0.62;
    const brilla = esOro ? 0.45 * suave(e.oro) : 0;
    items.push(
      <group key={i} position={[x, salto, z]} scale={[esc, esc, esc]}>
        <mesh position={[0, 0.42, 0]} castShadow>
          <cylinderGeometry args={[0.26, 0.3, 0.84, 18]} />
          <meshStandardMaterial color={color} roughness={0.5} emissive={esOro ? "#ff9a00" : "#000000"} emissiveIntensity={brilla} />
        </mesh>
        <mesh position={[0, 1.02, 0]} castShadow>
          <sphereGeometry args={[0.2, 18, 14]} />
          <meshStandardMaterial color="#f2d2b8" roughness={0.6} />
        </mesh>
      </group>,
    );
  }
  return <group>{items}</group>;
};
