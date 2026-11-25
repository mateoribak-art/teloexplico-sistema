import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/076-calentar-el-auto/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { AutoMotor, type EstadoAutoMotor } from "../../kit3d/objetos/AutoMotor";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: auto de costado, capó transparente con el motor, fondo azul noche; un frasco junto al auto se llena con el combustible gastado.
// Dato: FuelEconomy.gov (Departamento de Energía y EPA de EE. UU.).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  noHace: r.f(1),
  fuente: r.f(2),
  manejar: r.f(3),
  gasta: r.f(4),
  ojo: r.f(5),
  guardalo: r.f(6),
  pregunta: r.f(7),
  cta: r.f(8),
  fin: r.fin(8),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const k = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

const estado = (f: number): EstadoAutoMotor => {
  // parado y andando el motor: gancho hasta "manejar"; después el auto sale
  const parado = 1 - k(f, E.manejar, E.manejar + 10);
  const sale = k(f, E.manejar, E.manejar + 14) * (1 - k(f, E.gasta - 4, E.gasta));
  // el motor: se calienta lento parado, rápido manejando
  const motor = 0.12 * k(f, 0, E.manejar) + 0.88 * k(f, E.manejar, E.manejar + 55) * (1 - k(f, E.gasta, E.gasta + 20) * 0.6);
  return {
    frame: f,
    vibra: parado * k(f, 0, 8) * (1 - k(f, E.ojo, E.ojo + 6)) + 0.25 * (1 - parado) * 0,
    humo: k(f, 4, 20) * (1 - k(f, E.ojo, E.ojo + 8)) * (0.5 + 0.5 * parado),
    motor,
    rueda: sale + k(f, E.ojo, E.ojo + 4) * (1 - k(f, E.guardalo + 20, E.guardalo + 30)) * 0.6,
    frasco: k(f, E.gasta + 12, E.gasta + 140),
    frascoOn: k(f, E.gasta, E.gasta + 10) * (1 - k(f, E.ojo, E.ojo + 8)),
    capo: k(f, E.noHace, E.noHace + 14) * (1 - k(f, E.guardalo + 10, E.guardalo + 24)),
  };
};

const VISTA: Toma = { f: 0, pos: [0.5, 2.4, 15], mira: [0.5, 1.1, 0], fov: 42 };
const MOTOR: Toma = { f: 0, pos: [1.6, 2.0, 8.4], mira: [1.4, 1.0, 0], fov: 38 };
const FRASCO: Toma = { f: 0, pos: [2.4, 2.0, 9.4], mira: [2.2, 1.0, 0.3], fov: 40 };

const TOMAS: Toma[] = [
  { ...VISTA, f: 0 },
  { ...MOTOR, f: E.noHace },
  { ...VISTA, f: E.fuente },
  { ...MOTOR, f: E.manejar },
  { ...FRASCO, f: E.gasta },
  { ...VISTA, f: E.ojo },
  { ...MOTOR, f: E.guardalo },
  { ...VISTA, f: E.pregunta },
  { ...VISTA, f: DURACION },
];

const DESTACAR = ["calentando", "moderno", "FuelEconomy.gov", "segundos", "manejarlo", "combustible", "litros", "Guardalo", "número", "Mandáselo", "viejo"];
const CIFRAS: [string, string][] = [
  ["cinco minutos", "5 minutos"],
  ["un cuarto", "¼"],
];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.noHace, "scratch", 0.5],
  [E.fuente, "pop", 0.4],
  [E.manejar, "whoosh", 0.4],
  [E.gasta, "tic", 0.4],
  [E.gasta + 130, "ding", 0.45],
  [E.ojo, "sello", 0.5],
  [E.guardalo, "ding", 0.45],
  [E.pregunta, "pop", 0.4],
  [E.cta, "pop", 0.4],
];

export const CalentarElAuto3D: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <AutoMotor e={estado(frame)} />
        <PisoSombra y={0} />
      </Estudio>
      <Chip desde={E.gancho + 10} hasta={E.noHace} x={540} y={330} color="#ff9a2e">
        auto parado · <span style={{ color: ACENTO }}>5 minutos</span>
      </Chip>
      <Chip desde={E.noHace} hasta={E.fuente} x={540} y={330} color="#ff9a2e">
        autos modernos: <span style={{ color: ACENTO }}>no hace falta</span>
      </Chip>
      <Chip desde={E.fuente} hasta={E.manejar} x={540} y={330} color="#37d67a">
        FuelEconomy.gov · <span style={{ color: ACENTO }}>DOE y EPA</span>
      </Chip>
      <Chip desde={E.manejar} hasta={E.gasta} x={540} y={330} color="#37d67a">
        lo calienta más rápido: <span style={{ color: ACENTO }}>manejarlo</span>
      </Chip>
      <Chip desde={E.gasta} hasta={E.ojo} x={540} y={330} color="#ffb02e">
        parado: <span style={{ color: ACENTO }}>¼ a ½ galón por hora</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.guardalo} x={540} y={330} color="#5fd2ff">
        vale para autos <span style={{ color: ACENTO }}>modernos</span>
      </Chip>
      <Chip desde={E.guardalo} hasta={E.pregunta} x={540} y={330} color="#37d67a">
        arrancá · <span style={{ color: ACENTO }}>unos segundos</span> · salí
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={330}>
        ¿cuántos minutos? <span style={{ color: ACENTO }}>un número</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que deja el auto calentando" />
      <Audio src={staticFile("076-calentar-el-auto/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0.6, 2.2, 13], mira: [0.5, 1.1, 0], fov: 42 }];
export const Portada076: React.FC = () => (
  <Portada arriba="el auto calentando" grande="¿5 minutos parado?" sello="no hace falta" colorSello={C.azul} numero={76}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <AutoMotor e={{ frame: 40, vibra: 1, humo: 1, motor: 0.2, rueda: 0, frasco: 0.6, frascoOn: 1, capo: 1 }} />
      <PisoSombra y={0} opacidad={0.25} />
    </Estudio>
  </Portada>
);
