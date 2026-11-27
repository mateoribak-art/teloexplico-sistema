import React from "react";

// Detector de humo en el techo. Se desmonta, se da vuelta y muestra la etiqueta con la fecha de fabricación atrás.
// `baja` 0→1 baja del techo, `giro` 0→1 se da vuelta (el dorso mira a cámara), `boton` 0→1 prueba (luz roja + ondas),
// `chirp` 0→1 ondas chicas de chirrido, `reloj` 0→1 aro de 10 años que se llena. `frame` titila el led.

export type EstadoAlarma = {
  frame: number;
  baja: number;
  giro: number;
  boton: number;
  chirp: number;
  reloj: number;
};

const cl = (v: number) => Math.min(1, Math.max(0, v));

export const Alarma: React.FC<{ e: EstadoAlarma }> = ({ e }) => {
  const baja = cl(e.baja);
  const giro = cl(e.giro);
  const boton = cl(e.boton);
  const chirp = cl(e.chirp);
  const reloj = cl(e.reloj);
  const y = 1.6 - baja * 0.45;
  const ledOn = boton > 0.05 ? 1 : Math.sin(e.frame / 14) > 0.85 ? 1 : 0.15;
  const ondas = (t: number, color: string, maxR: number) =>
    t > 0.02
      ? [0, 1, 2].map((i) => {
          const p = (((e.frame / 22 + i / 3) % 1) + 1) % 1;
          return (
            <mesh key={i} position={[0, -0.18, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.6 + p * maxR, 0.6 + p * maxR, 1]}>
              <ringGeometry args={[0.95, 1, 40]} />
              <meshBasicMaterial color={color} transparent opacity={t * (1 - p) * 0.8} />
            </mesh>
          );
        })
      : null;
  return (
    <group>
      {/* techo */}
      <mesh position={[0, 1.78, 0]} receiveShadow>
        <boxGeometry args={[9, 0.2, 9]} />
        <meshStandardMaterial color="#2a3550" roughness={0.95} />
      </mesh>
      {/* huella de la base en el techo cuando se baja la alarma */}
      <mesh position={[0, 1.675, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.01, 32]} />
        <meshStandardMaterial color="#3c4a70" roughness={1} />
      </mesh>
      <group position={[0, y, 0]} rotation={[giro * (Math.PI / 2), 0, 0]}>
        {/* placa de montaje (dorso) */}
        <mesh position={[0, 0.07, 0]}>
          <cylinderGeometry args={[0.52, 0.52, 0.08, 40]} />
          <meshStandardMaterial color="#d8dde6" roughness={0.6} />
        </mesh>
        {/* cuerpo */}
        <mesh position={[0, -0.04, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.52, 0.16, 40]} />
          <meshStandardMaterial color="#eef1f6" roughness={0.45} />
        </mesh>
        {/* cúpula del frente */}
        <mesh position={[0, -0.16, 0]} castShadow>
          <cylinderGeometry args={[0.36, 0.5, 0.1, 40]} />
          <meshStandardMaterial color="#f7f9fc" roughness={0.4} />
        </mesh>
        {/* rejilla del sensor */}
        {[0.12, 0.2, 0.28].map((r, i) => (
          <mesh key={i} position={[0, -0.215, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[r, 0.012, 8, 40]} />
            <meshStandardMaterial color="#9aa3b4" />
          </mesh>
        ))}
        {/* botón de prueba */}
        <mesh position={[0, -0.225, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.03, 20]} />
          <meshStandardMaterial color="#c8cfdb" emissive="#ff3b30" emissiveIntensity={boton * 1.4} />
        </mesh>
        {/* led */}
        <mesh position={[0.4, -0.12, 0]}>
          <sphereGeometry args={[0.03, 12, 12]} />
          <meshStandardMaterial color={ledOn > 0.5 ? "#ff3b30" : "#552222"} emissive="#ff3b30" emissiveIntensity={ledOn * 2} />
        </mesh>
        {/* etiqueta del dorso: papel con renglones */}
        <mesh position={[0, 0.115, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.62, 0.42]} />
          <meshStandardMaterial color="#fff6c9" roughness={0.9} />
        </mesh>
        {[-0.12, -0.03, 0.06, 0.15].map((z, i) => (
          <mesh key={i} position={[(i % 2 ? 0.05 : 0) - 0.04, 0.117, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[i === 0 ? 0.4 : 0.5, 0.045]} />
            <meshStandardMaterial color={i === 0 ? "#d6362b" : "#2c2f3a"} />
          </mesh>
        ))}
      </group>
      {/* ondas de la prueba y del chirrido */}
      <group position={[0, y, 0]}>
        {ondas(boton, "#ff6a5a", 3.2)}
        {ondas(chirp, "#ffd23d", 1.8)}
      </group>
      {/* aro de 10 años */}
      {reloj > 0.01 && (
        <mesh position={[0, 0.95, 0.6]}>
          <torusGeometry args={[0.4, 0.04, 12, 60, Math.PI * 2 * reloj]} />
          <meshStandardMaterial color="#5fd2ff" emissive="#2aa8e0" emissiveIntensity={1.2} />
        </mesh>
      )}
    </group>
  );
};
