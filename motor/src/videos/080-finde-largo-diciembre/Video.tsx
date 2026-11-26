import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import tiemposJson from "../../../public/080-finde-largo-diciembre/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Un solo mundo: hojas de calendario de diciembre 2026 en el estudio azul noche. Fila 1: sáb 5, dom 6, lun 7 (no laborable), mar 8 (feriado).
// Fila 2 (aparece con Navidad): vie 25, sáb 26, dom 27. Fuente: Chequeado, Feriados 2026; Resolución 164/2025 (Jefatura de Gabinete).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  martes: r.f(1),
  lunes: r.f(2),
  cuatro: r.f(3),
  distinto: r.f(4),
  privado: r.f(5),
  navidad: r.f(6),
  ojo: r.f(7),
  pregunta: r.f(8),
  cta: r.f(9),
  fin: r.fin(9),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const k = (frame: number, pares: [number, number][]) => {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const [x, y] of pares) {
    xs.push(xs.length && x <= xs[xs.length - 1] ? xs[xs.length - 1] + 1 : x);
    ys.push(y);
  }
  return interpolate(frame, xs, ys, clamp);
};

const GRIS = "#6f86b3";
const AMBAR = "#ffc53d";
const ROJO = "#ff4d4d";

const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rad: number) => {
  g.beginPath();
  g.moveTo(x + rad, y);
  g.arcTo(x + w, y, x + w, y + h, rad);
  g.arcTo(x + w, y + h, x, y + h, rad);
  g.arcTo(x, y + h, x, y, rad);
  g.arcTo(x, y, x + w, y, rad);
  g.closePath();
};

const caraDia = (dia: string, num: string, color: string) => {
  const c = document.createElement("canvas");
  c.width = 400;
  c.height = 520;
  const g = c.getContext("2d")!;
  g.fillStyle = "#0f1526";
  rr(g, 0, 0, 400, 520, 36);
  g.fill();
  g.lineWidth = 12;
  g.strokeStyle = color;
  rr(g, 8, 8, 384, 504, 30);
  g.stroke();
  g.fillStyle = color;
  rr(g, 20, 20, 360, 110, 22);
  g.fill();
  g.fillStyle = "#0b0f1c";
  g.font = "bold 66px Arial";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(dia, 200, 78);
  g.fillStyle = "#ffffff";
  g.font = "bold 250px Arial";
  g.fillText(num, 200, 330);
  g.fillStyle = color;
  g.font = "bold 44px Arial";
  g.fillText("DIC", 200, 466);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

const cuerpo = new RoundedBoxGeometry(1.1, 1.43, 0.14, 5, 0.08);

const Hoja: React.FC<{ dia: string; num: string; color: string; x: number; y: number; v: number; brillo: number }> = ({ dia, num, color, x, y, v, brillo }) => {
  const frame = useCurrentFrame();
  const cara = useMemo(() => caraDia(dia, num, color), [dia, num, color]);
  if (v <= 0.001) return null;
  const pulso = 1 + brillo * 0.05 * Math.sin(frame / 5);
  return (
    <group position={[x, y, 0]} scale={v * pulso}>
      <mesh geometry={cuerpo} castShadow scale={1 + 0.06 * brillo}>
        <meshStandardMaterial color="#0e1324" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[1.08, 1.4]} />
        <meshBasicMaterial map={cara} toneMapped={false} />
      </mesh>
    </group>
  );
};

const MIRA: [number, number, number] = [0, 1.0, 0];
const TOMAS: Toma[] = [
  { f: 0, pos: [0, 1.0, 18], mira: MIRA, fov: 34 },
  { f: E.lunes, pos: [0.3, 1.6, 17], mira: [0.3, 1.6, 0], fov: 34 },
  { f: E.cuatro, pos: [0, 1.4, 18.5], mira: [0, 1.4, 0], fov: 34 },
  { f: E.navidad, pos: [0, 0.8, 19.5], mira: [0, 0.8, 0], fov: 34 },
  { f: E.ojo + 6, pos: [0, 0.8, 20], mira: [0, 0.8, 0], fov: 34 },
  { f: DURACION, pos: [0, 0.8, 19], mira: [0, 0.8, 0], fov: 34 },
];

const DESTACAR = ["feriado", "nacional", "no", "laborable", "cuatro", "Navidad", "Ojo:", "Mandáselo", "empresa", "escapada", "ocho", "siete", "veinticinco"];
const CIFRAS: [string, string][] = [
  ["ocho", "8"],
  ["siete", "7"],
  ["veinticinco", "25"],
  ["cuatro", "4"],
  ["tres", "3"],
];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.martes, "ding", 0.45],
  [E.lunes, "pop", 0.45],
  [E.cuatro, "whoosh", 0.4],
  [E.distinto, "scratch", 0.35],
  [E.privado, "tic", 0.4],
  [E.navidad, "whoosh", 0.4],
  [E.ojo, "pop", 0.4],
  [E.pregunta, "ding", 0.4],
  [E.cta, "pop", 0.4],
];

export const FindeLargoDic3D: React.FC = () => {
  const frame = useCurrentFrame();
  const entra = (f: number) => k(frame, [[f, 0], [f + 10, 1.12], [f + 16, 1]]);
  const vSab = entra(E.gancho + 2);
  const vDom = entra(E.gancho + 6);
  const vLun = entra(E.gancho + 10);
  const vMar = entra(E.gancho + 14);
  const bLun = k(frame, [[E.lunes, 0], [E.lunes + 8, 1], [E.cuatro, 1], [E.cuatro + 6, 0.3]]);
  const bMar = k(frame, [[E.martes, 0], [E.martes + 8, 1], [E.lunes, 1], [E.lunes + 6, 0.3]]);
  const bFin = k(frame, [[E.cuatro, 0], [E.cuatro + 8, 0.9], [E.distinto, 0.9], [E.distinto + 6, 0]]);
  const bLun2 = k(frame, [[E.distinto, 0], [E.distinto + 8, 1], [E.navidad, 1], [E.navidad + 6, 0.2]]);
  const filaUp = k(frame, [[E.navidad, 0], [E.navidad + 14, 1]]);
  const vNav = (d: number) => entra(E.navidad + 4 + d);
  const yA = 1.45 - 0.0 * filaUp;
  const yB = -0.6;
  const bNav = k(frame, [[E.navidad + 6, 0], [E.navidad + 14, 1], [E.ojo, 1], [E.ojo + 8, 0.3]]);
  return (
    <AbsoluteFill>
      <Estudio fov={34}>
        <Camara tomas={TOMAS} />
        <Hoja dia="SÁB" num="5" color={GRIS} x={-2.1} y={yA} v={vSab} brillo={Math.max(bFin, 0.2 * vSab)} />
        <Hoja dia="DOM" num="6" color={GRIS} x={-0.7} y={yA} v={vDom} brillo={Math.max(bFin, 0.2 * vDom)} />
        <Hoja dia="LUN" num="7" color={AMBAR} x={0.7} y={yA} v={vLun} brillo={Math.max(bLun, bFin, bLun2, 0.2 * vLun)} />
        <Hoja dia="MAR" num="8" color={ROJO} x={2.1} y={yA} v={vMar} brillo={Math.max(bMar, bFin, 0.2 * vMar)} />
        <Hoja dia="VIE" num="25" color={ROJO} x={-1.4} y={yB} v={vNav(0)} brillo={bNav} />
        <Hoja dia="SÁB" num="26" color={GRIS} x={0} y={yB} v={vNav(4)} brillo={Math.min(bNav, 0.5)} />
        <Hoja dia="DOM" num="27" color={GRIS} x={1.4} y={yB} v={vNav(8)} brillo={Math.min(bNav, 0.5)} />
      </Estudio>
      <Chip desde={0} hasta={E.martes} x={540} y={300}>
        Finde de <span style={{ color: ACENTO }}>4 días</span> en diciembre
      </Chip>
      <Chip desde={E.martes} hasta={E.lunes} x={540} y={300}>
        Mar 8 · <span style={{ color: ACENTO }}>feriado nacional</span>
      </Chip>
      <Chip desde={E.lunes} hasta={E.cuatro} x={540} y={300}>
        Lun 7 · <span style={{ color: ACENTO }}>no laborable</span>
      </Chip>
      <Chip desde={E.cuatro} hasta={E.distinto} x={540} y={300}>
        Sáb 5 a mar 8 · <span style={{ color: ACENTO }}>4 días</span>
      </Chip>
      <Chip desde={E.distinto} hasta={E.privado} x={540} y={300}>
        No laborable <span style={{ color: ACENTO }}>≠</span> feriado
      </Chip>
      <Chip desde={E.privado} hasta={E.navidad} x={540} y={300}>
        Privado: <span style={{ color: ACENTO }}>decide la empresa</span>
      </Chip>
      <Chip desde={E.navidad} hasta={E.ojo} x={540} y={300}>
        Navidad · vie 25 a dom 27 · <span style={{ color: ACENTO }}>3 días</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.pregunta} x={540} y={300}>
        Confirmalo con <span style={{ color: ACENTO }}>tu empresa</span> · Chequeado
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={300}>
        ¿Te vas o te <span style={{ color: ACENTO }}>quedás</span>?
      </Chip>
      <Chip desde={E.cta} hasta={E.fin + 4} x={540} y={300}>
        📌 Sáb 5 a mar 8 · Vie 25 a dom 27
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que ya está armando la escapada" />
      <Audio src={staticFile("080-finde-largo-diciembre/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 0, 17], mira: [0, 0, 0], fov: 34 }];
export const Portada080: React.FC = () => (
  <Portada arriba="finde largo de diciembre" grande="el lunes 7 no es feriado" sello="4 DÍAS" colorSello={C.azul} numero={80}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Hoja dia="SÁB" num="5" color={GRIS} x={-2.1} y={0} v={1} brillo={0.2} />
      <Hoja dia="DOM" num="6" color={GRIS} x={-0.7} y={0} v={1} brillo={0.2} />
      <Hoja dia="LUN" num="7" color={AMBAR} x={0.7} y={0} v={1} brillo={1} />
      <Hoja dia="MAR" num="8" color={ROJO} x={2.1} y={0} v={1} brillo={0.6} />
    </Estudio>
  </Portada>
);
