import React from "react";
import { AbsoluteFill } from "remotion";
import { C, mono } from "../kit/marca";
import { Fondo } from "../kit/piezas";
import { Anafe, Auto, Barrio, Bife, Heladera, Nube, Olla, Persona, Sarten, Sol, Termometro, Vaso } from "../kit/biblioteca";

// Lámina de la biblioteca: todos los objetos juntos para revisar que parezcan de la misma mano.
const Celda: React.FC<{ i: number; nombre: string; children: React.ReactNode }> = ({ i, nombre, children }) => {
  const x = (i % 4) * 600;
  const y = Math.floor(i / 4) * 533;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={6} y={6} width={588} height={521} fill="none" stroke={C.cuadricula} strokeWidth={4} />
      <text x={24} y={44} fontFamily={mono} fontWeight={700} fontSize={26} fill={C.tinta}>{nombre}</text>
      {children}
    </g>
  );
};

export const Catalogo: React.FC = () => (
  <AbsoluteFill style={{ background: C.papel }}>
    <Fondo />
    <svg width={2400} height={1600} style={{ position: "absolute", inset: 0 }}>
      <Celda i={0} nombre="nube"><Nube x={290} y={400} s={1.1} t={10} /><Nube x={470} y={250} s={0.45} tormenta={0.8} /></Celda>
      <Celda i={1} nombre="sol"><Sol x={300} y={290} s={1} t={10} /></Celda>
      <Celda i={2} nombre="heladera (abierta)">
        <Heladera x={200} y={490} s={0.95} />
        <Heladera x={440} y={490} s={0.85} abierta={0.8} t={10} />
      </Celda>
      <Celda i={3} nombre="olla"><Olla x={210} y={460} s={0.85} t={10} /><Olla x={460} y={460} s={0.6} tapa color={C.azul} /></Celda>
      <Celda i={4} nombre="sartén + bife"><Sarten x={250} y={330} s={1.1}><Bife x={0} y={0} s={0.7} coccion={0.6} marcas /></Sarten></Celda>
      <Celda i={5} nombre="bife (crudo / hecho)"><Bife x={180} y={250} s={0.85} /><Bife x={420} y={400} s={0.85} coccion={1} marcas rot={-10} /></Celda>
      <Celda i={6} nombre="persona"><Persona x={200} y={520} s={0.85} t={10} gesto="sorprendida" /><Persona x={440} y={520} s={0.7} t={10} gesto="canchera" pelo="largo" remera={C.verde} mira={-1} /></Celda>
      <Celda i={7} nombre="anafe"><Anafe x={300} y={420} s={1.1} t={10} fuego={[1, 0.6]} /></Celda>
      <Celda i={8} nombre="termómetro"><Termometro x={200} y={500} s={0.95} valor={0.75} /><Termometro x={420} y={500} s={0.95} valor={0.2} color={C.azul} /></Celda>
      <Celda i={9} nombre="vaso"><Vaso x={200} y={470} s={1.2} hielo={3} gotas /><Vaso x={440} y={470} s={1.2} nivel={0.5} liquido="#9AD3FF" /></Celda>
      <Celda i={10} nombre="barrio">
        <g transform="translate(20 0) scale(0.52)"><Barrio suelo={960} t={10} /><rect x={0} y={960} width={1080} height={24} fill={C.verde} stroke={C.tinta} strokeWidth={6} /></g>
      </Celda>
      <Celda i={11} nombre="auto"><Auto x={300} y={380} s={1.1} color={C.rojo} t={10} /></Celda>
    </svg>
  </AbsoluteFill>
);
