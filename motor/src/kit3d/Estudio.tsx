import React, { useLayoutEffect } from "react";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// Estudio 3D estilo "objeto en vitrina": fondo azul noche con viñeta, polvo flotando,
// luz principal cálida arriba a la izquierda, contraluz frío y reflejos de un cuarto (RoomEnvironment,
// se genera con código: no hay archivos HDRI ni licencias de por medio).

export const FONDO = { centro: "#1b2a4a", borde: "#05070d" };

const Entorno: React.FC = () => {
  const { gl, scene } = useThree();
  useLayoutEffect(() => {
    gl.localClippingEnabled = true;
    const pm = new THREE.PMREMGenerator(gl);
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.9;
    return () => {
      scene.environment = null;
      env.dispose();
      pm.dispose();
    };
  }, [gl, scene]);
  return null;
};

/** Polvo que flota delante del fondo (HTML, barato): puntitos suaves que derivan despacio. */
const Polvo: React.FC<{ cantidad?: number }> = ({ cantidad = 26 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: cantidad }, (_, i) => {
        const x0 = random(`px${i}`) * width;
        const y0 = random(`py${i}`) * height;
        const tam = 3 + random(`pt${i}`) * 7;
        const vel = 0.15 + random(`pv${i}`) * 0.35;
        const x = x0 + Math.sin(frame / 90 + i) * 30;
        const y = ((y0 - frame * vel) % height + height) % height;
        const brillo = 0.12 + 0.3 * (0.5 + 0.5 * Math.sin(frame / 25 + i * 1.7));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: tam,
              height: tam,
              borderRadius: "50%",
              background: "#cfe0ff",
              opacity: brillo,
              filter: `blur(${tam > 7 ? 2 : 0.6}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** `fondo={false}`: solo el objeto sobre transparente (portadas). */
export const Estudio: React.FC<{ children: React.ReactNode; fov?: number; fondo?: boolean }> = ({ children, fov = 28, fondo = true }) => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill
      style={fondo ? { background: `radial-gradient(ellipse 85% 60% at 50% 42%, ${FONDO.centro} 0%, #0d1528 55%, ${FONDO.borde} 100%)` } : undefined}
    >
      {fondo && <Polvo />}
      <ThreeCanvas
        width={width}
        height={height}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        camera={{ fov, near: 0.05, far: 100, position: [0, 1.2, 9] }}
        shadows
      >
        <Entorno />
        <ambientLight intensity={0.25} color="#b8c8ff" />
        {/* principal: cálida, arriba a la izquierda, con sombra suave */}
        <directionalLight
          position={[-4, 7, 5]}
          intensity={2.2}
          color="#fff3e0"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0004}
          shadow-camera-left={-4}
          shadow-camera-right={4}
          shadow-camera-top={4}
          shadow-camera-bottom={-4}
        />
        {/* relleno frío desde la derecha */}
        <directionalLight position={[5, 2, 3]} intensity={0.6} color="#9fb8ff" />
        {/* contraluz que recorta el borde contra el fondo */}
        <directionalLight position={[0, 4, -6]} intensity={1.6} color="#a9c4ff" />
        {children}
      </ThreeCanvas>
      {/* viñeta por encima de todo, como en un lente */}
      {fondo && (
        <AbsoluteFill
          style={{ background: "radial-gradient(ellipse 75% 65% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)", pointerEvents: "none" }}
        />
      )}
    </AbsoluteFill>
  );
};

/** Piso invisible que solo recibe la sombra (el objeto "apoya" en algo sin ver una mesa). */
export const PisoSombra: React.FC<{ y?: number; opacidad?: number }> = ({ y = 0, opacidad = 0.35 }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} receiveShadow>
    <planeGeometry args={[30, 30]} />
    <shadowMaterial transparent opacity={opacidad} />
  </mesh>
);
