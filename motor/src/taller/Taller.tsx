import React from "react";
import { AbsoluteFill } from "remotion";
import { C, display, mono } from "../kit/marca";
import { Fondo } from "../kit/piezas";
import { AireSplit } from "../kit/biblioteca";

// Taller de dibujo (skill dibujar-objeto): poné acá el objeto que estás haciendo.
// Izquierda: grande, para ver detalles. Derecha: como se verá en un celular (chico) y sobre el fondo real.
// Reemplazá <Objeto /> por tu dibujo; `tlx taller` lo renderiza en videos/_taller/taller.png.

const Objeto: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <AireSplit x={300} y={240} s={1.0} t={t} temp={17} soplando={1} />
    <AireSplit x={300} y={620} s={0.9} t={t} temp={24} soplando={0.2} colorTemp={C.azul} />
  </g>
);

export const Taller: React.FC = () => (
  <AbsoluteFill style={{ background: C.papel }}>
    <Fondo />
    <svg width={900} height={1000} viewBox="0 0 600 1000" style={{ position: "absolute", left: 0, top: 0 }}>
      <Objeto t={20} />
    </svg>
    <div style={{ position: "absolute", left: 980, top: 60, fontFamily: mono, fontWeight: 700, fontSize: 28, color: C.tinta }}>
      así se ve en el celular
    </div>
    <div style={{ position: "absolute", left: 980, top: 120, width: 270, height: 480, border: `4px solid ${C.tinta}`, borderRadius: 18, overflow: "hidden", background: C.papel }}>
      <svg width={270} height={480} viewBox="0 0 600 1066">
        <Objeto t={20} />
      </svg>
    </div>
    <div style={{ position: "absolute", left: 980, top: 640, width: 560, fontFamily: display, fontWeight: 800, fontSize: 34, color: C.tinta }}>
      ¿Se entiende qué es sin leer nada? ¿Tiene volumen, textura y sombra dura?
    </div>
  </AbsoluteFill>
);
