import React, { useMemo } from "react";

// Perro sentado de frente (primitivas) y, delante, tres alimentos sobre una mesa baja:
// chocolate (x = -1.9), uvas (x = 0) y cebolla (x = 1.9). Cada uno puede llevar un cartel de prohibido.
// Todo sale del frame. Piso en y = 0, perro en z = -1.4, alimentos en z = 1.2.

export type EstadoPerroComida = {
  frame: number;
  plato: number; // 0..1 plato con un cachito (gancho)
  choco: number; // 0..1 aparece el chocolate
  uvas: number;
  cebolla: number;
  noChoco: number; // 0..1 cartel de prohibido
  noUvas: number;
  noCebolla: number;
  ruega: number; // 0..1 el perro pide (cabeza inclinada, cola)
};

export const X_ALIM = { choco: -1.9, uvas: 0, cebolla: 1.9 };

const Prohibido: React.FC<{ x: number; t: number }> = ({ x, t }) => {
  if (t < 0.01) return null;
  const s = 0.4 + 0.6 * Math.min(1, t * 1.2);
  return (
    <group position={[x, 0.95, 3.7]} scale={s * 0.62}>
      <mesh>
        <torusGeometry args={[0.95, 0.1, 16, 48]} />
        <meshStandardMaterial color="#ff3b3b" emissive="#ff1f1f" emissiveIntensity={0.6} roughness={0.4} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[1.9, 0.2, 0.1]} />
        <meshStandardMaterial color="#ff3b3b" emissive="#ff1f1f" emissiveIntensity={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
};

const Elipse: React.FC<{ p: [number, number, number]; s: [number, number, number]; c: string; r?: [number, number, number]; rough?: number }> = ({ p, s, c, r, rough = 0.85 }) => (
  <mesh position={p} scale={s} rotation={r} castShadow>
    <sphereGeometry args={[1, 28, 20]} />
    <meshStandardMaterial color={c} roughness={rough} />
  </mesh>
);

export const PerroComida: React.FC<{ e: EstadoPerroComida }> = ({ e }) => {
  const f = e.frame;
  const uvas = useMemo(() => {
    const pts: [number, number, number][] = [];
    const filas = [3, 2, 1];
    filas.forEach((n, fi) => {
      for (let i = 0; i < n; i++) pts.push([(i - (n - 1) / 2) * 0.36, 0.95 - fi * 0.3, (i % 2) * 0.05]);
    });
    pts.push([-0.36, 0.95 - 0.05, 0.0], [0.36, 0.95 - 0.05, 0.0]);
    return pts;
  }, []);
  const cola = Math.sin(f / 4) * 0.5 * (0.3 + e.ruega);
  const inclina = Math.sin(f / 18) * 0.12 * e.ruega + 0.14 * e.ruega;
  const sp = (t: number) => Math.max(0.0001, t);
  return (
    <group>
      {/* mesa baja */}
      <mesh position={[0, 0.0, 2.9]} receiveShadow castShadow>
        <boxGeometry args={[6.4, 0.16, 2.6]} />
        <meshStandardMaterial color="#8a6a4a" roughness={0.7} />
      </mesh>

      {/* perro (de frente, sentado) */}
      <group position={[0, 0, -1.4]}>
        <Elipse p={[0, 1.15, 0]} s={[1.0, 1.25, 0.85]} c="#c9955a" />
        <Elipse p={[0, 0.95, 0.45]} s={[0.6, 0.9, 0.35]} c="#f1dcb8" />
        {/* patas delanteras */}
        <mesh position={[-0.42, 0.55, 0.55]} castShadow>
          <cylinderGeometry args={[0.2, 0.22, 1.1, 18]} />
          <meshStandardMaterial color="#c9955a" roughness={0.85} />
        </mesh>
        <mesh position={[0.42, 0.55, 0.55]} castShadow>
          <cylinderGeometry args={[0.2, 0.22, 1.1, 18]} />
          <meshStandardMaterial color="#c9955a" roughness={0.85} />
        </mesh>
        <Elipse p={[-0.42, 0.08, 0.72]} s={[0.3, 0.14, 0.4]} c="#f1dcb8" />
        <Elipse p={[0.42, 0.08, 0.72]} s={[0.3, 0.14, 0.4]} c="#f1dcb8" />
        {/* cola */}
        <group position={[0.9, 0.35, -0.5]} rotation={[0, 0, cola]}>
          <Elipse p={[0.3, 0.15, 0]} s={[0.55, 0.14, 0.14]} c="#b07a42" r={[0, 0, 0.3]} />
        </group>
        {/* cabeza */}
        <group position={[0, 2.5, 0.25]} rotation={[0, 0, inclina]}>
          <Elipse p={[0, 0, 0]} s={[0.72, 0.66, 0.66]} c="#c9955a" />
          <Elipse p={[0, -0.18, 0.52]} s={[0.4, 0.3, 0.38]} c="#f1dcb8" />
          <Elipse p={[0, -0.02, 0.88]} s={[0.15, 0.11, 0.1]} c="#1b1b22" rough={0.3} />
          {/* ojos */}
          <Elipse p={[-0.26, 0.14, 0.58]} s={[0.1, 0.12, 0.06]} c="#1b1b22" rough={0.2} />
          <Elipse p={[0.26, 0.14, 0.58]} s={[0.1, 0.12, 0.06]} c="#1b1b22" rough={0.2} />
          <Elipse p={[-0.28, 0.2, 0.62]} s={[0.035, 0.035, 0.03]} c="#ffffff" rough={0.2} />
          <Elipse p={[0.24, 0.2, 0.62]} s={[0.035, 0.035, 0.03]} c="#ffffff" rough={0.2} />
          {/* orejas caídas */}
          <Elipse p={[-0.68, 0.0, -0.05]} s={[0.2, 0.5, 0.3]} c="#8c5a2b" r={[0, 0, 0.25]} />
          <Elipse p={[0.68, 0.0, -0.05]} s={[0.2, 0.5, 0.3]} c="#8c5a2b" r={[0, 0, -0.25]} />
          {/* lengua */}
          <Elipse p={[0.0, -0.46 - 0.12 * e.ruega, 0.66]} s={[0.1, 0.1 + 0.15 * e.ruega, 0.06]} c="#ef7b8c" />
        </group>
      </group>

      {/* plato con un cachito (gancho) */}
      {e.plato > 0.01 && (
        <group position={[0, 0.08, 3.1]} scale={[sp(e.plato), sp(e.plato), sp(e.plato)]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[1.5, 1.2, 0.14, 40]} />
            <meshStandardMaterial color="#f4f1ea" roughness={0.3} />
          </mesh>
          <Elipse p={[-0.3, 0.2, 0]} s={[0.4, 0.2, 0.3]} c="#b5683a" />
          <Elipse p={[0.35, 0.18, 0.1]} s={[0.35, 0.16, 0.28]} c="#d9a35a" />
        </group>
      )}

      {/* chocolate */}
      {e.choco > 0.01 && (
        <group position={[X_ALIM.choco, 0.1, 2.9]} rotation={[0, 0.25, 0]} scale={sp(e.choco)}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[1.1, 0.16, 1.7]} />
            <meshStandardMaterial color="#3d2314" roughness={0.45} />
          </mesh>
          {[0, 1, 2].map((i) =>
            [0, 1, 2, 3].map((j) => (
              <mesh key={`${i}${j}`} position={[(i - 1) * 0.34, 0.6, (j - 1.5) * 0.4]} castShadow>
                <boxGeometry args={[0.28, 0.06, 0.34]} />
                <meshStandardMaterial color="#5a3420" roughness={0.4} />
              </mesh>
            ))
          )}
        </group>
      )}

      {/* uvas */}
      {e.uvas > 0.01 && (
        <group position={[X_ALIM.uvas, 0.1, 2.9]} scale={sp(e.uvas)}>
          {uvas.map((p, i) => (
            <mesh key={i} position={[p[0], p[1] - 0.25 + 0.55, p[2]]} castShadow>
              <sphereGeometry args={[0.22, 20, 16]} />
              <meshStandardMaterial color="#5b2a86" roughness={0.3} metalness={0.05} />
            </mesh>
          ))}
          <mesh position={[0, 1.45, 0]} rotation={[0, 0, 0.3]}>
            <cylinderGeometry args={[0.04, 0.05, 0.4, 8]} />
            <meshStandardMaterial color="#5a7a2e" roughness={0.8} />
          </mesh>
        </group>
      )}

      {/* cebolla */}
      {e.cebolla > 0.01 && (
        <group position={[X_ALIM.cebolla, 0.1, 2.9]} scale={sp(e.cebolla)}>
          <Elipse p={[0, 0.75, 0]} s={[0.78, 0.68, 0.78]} c="#d9a96b" rough={0.5} />
          <Elipse p={[0, 0.75, 0]} s={[0.8, 0.5, 0.8]} c="#c98b4f" rough={0.5} />
          <mesh position={[0, 1.5, 0]} castShadow>
            <coneGeometry args={[0.2, 0.5, 16]} />
            <meshStandardMaterial color="#c9a05a" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.12, 0.05, 0.1, 10]} />
            <meshStandardMaterial color="#e9dcc0" roughness={0.8} />
          </mesh>
        </group>
      )}

      <Prohibido x={X_ALIM.choco} t={e.noChoco} />
      <Prohibido x={X_ALIM.uvas} t={e.noUvas} />
      <Prohibido x={X_ALIM.cebolla} t={e.noCebolla} />
    </group>
  );
};
