import React, { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { feature } from "topojson-client";
import { geoAzimuthalEqualArea, geoCentroid, geoDistance } from "d3-geo";
import type { Feature, Geometry } from "geojson";
import mundo from "world-atlas/countries-50m.json";

// Mapa 3D con geografía REAL (Natural Earth 1:50m, vía world-atlas) para la serie "Argentina en datos" y clima.
// Proyección acimutal de áreas iguales centrada en `centro`: los tamaños se pueden comparar de verdad.
// El mapa queda parado en el plano XY (mira a la cámara) y los países tienen espesor hacia +z.
// Nombres de países en inglés, como vienen en Natural Earth ("Argentina", "Italy", "Spain", "United Kingdom"…).

export type LonLat = [number, number];
export const CENTRO_AR: LonLat = [-64, -38];
/** unidades de la escena por radián: con 8, Argentina mide ~4,6 de alto */
export const RADIO = 8;
const GROSOR = 0.12;

const PAISES = (feature(mundo as any, (mundo as any).objects.countries) as any).features as Feature<Geometry, { name: string }>[];
export const paisPorNombre = (nombre: string) => {
  const p = PAISES.find((f) => f.properties.name === nombre);
  if (!p) throw new Error(`Mapa3D: no existe el país "${nombre}"`);
  return p;
};

const proyectar = (centro: LonLat) => geoAzimuthalEqualArea().rotate([-centro[0], -centro[1]]).scale(RADIO).translate([0, 0]);
/** posición en la escena (x, y) de un punto lon/lat del mapa centrado en `centro` */
export const enMapa = (lonlat: LonLat, centro: LonLat = CENTRO_AR): [number, number] => {
  const [x, y] = proyectar(centro)(lonlat)!;
  return [x, -y];
};

const poligonos = (g: Geometry): number[][][][] =>
  g.type === "Polygon" ? [g.coordinates as any] : g.type === "MultiPolygon" ? (g.coordinates as any) : [];

/** Formas THREE de un país con la proyección dada (y invertida: en pantalla el norte va arriba). */
const formas = (pais: Feature<Geometry>, proy: (p: LonLat) => [number, number] | null, minArea = 0) => {
  const out: THREE.Shape[] = [];
  const polis = poligonos(pais.geometry);
  const area = (poli: number[][][]) => Math.abs(THREE.ShapeUtils.area(poli[0].map(([x, y]) => new THREE.Vector2(x, y))));
  const mayor = Math.max(...polis.map(area));
  for (const poli of polis) {
    if (area(poli) < mayor * minArea) continue;
    const anillos = poli.map((anillo) => anillo.map((p) => proy(p as LonLat)).filter((p): p is [number, number] => !!p).map(([x, y]) => new THREE.Vector2(x, -y)));
    if (anillos[0].length < 3) continue;
    const forma = new THREE.Shape(anillos[0]);
    for (const h of anillos.slice(1)) if (h.length >= 3) forma.holes.push(new THREE.Path(h));
    out.push(forma);
  }
  return out;
};

const extruir = (fs: THREE.Shape[]) => new THREE.ExtrudeGeometry(fs, { depth: GROSOR, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.015, bevelSegments: 1 });

/** Textura de "satélite" pintada con código: manchas de verdes y ocres (sin imágenes externas). */
const texturaTierra = (() => {
  let tex: THREE.CanvasTexture | null = null;
  return () => {
    if (tex) return tex;
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const g = c.getContext("2d")!;
    g.fillStyle = "#4a7334";
    g.fillRect(0, 0, 512, 512);
    const tonos = ["#2f5a26", "#6c8a32", "#a08540", "#244a20", "#557d2c", "#b8925a"];
    for (let i = 0; i < 520; i++) {
      const x = random(`tx${i}`) * 512;
      const y = random(`ty${i}`) * 512;
      const r = 6 + random(`tr${i}`) * 38;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, tonos[i % tonos.length] + "aa");
      gr.addColorStop(1, tonos[i % tonos.length] + "00");
      g.fillStyle = gr;
      // repetida en los bordes para que la textura empalme sin costuras
      for (const dx of [-512, 0, 512])
        for (const dy of [-512, 0, 512]) {
          g.save();
          g.translate(dx, dy);
          g.beginPath();
          g.arc(x, y, r, 0, Math.PI * 2);
          g.fill();
          g.restore();
        }
    }
    tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(0.35, 0.35);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };
})();

const Borde: React.FC<{ fs: THREE.Shape[]; z: number; color?: string; opacidad?: number }> = ({ fs, z, color = "#ffffff", opacidad = 0.85 }) => {
  const lineas = useMemo(
    () =>
      fs.map((f) => {
        const geo = new THREE.BufferGeometry().setFromPoints(f.getPoints().map((p) => new THREE.Vector3(p.x, p.y, z)));
        return new THREE.LineLoop(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: opacidad }));
      }),
    [fs, z, color, opacidad],
  );
  return (
    <>
      {lineas.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
    </>
  );
};

/** Territorios que se pintan igual que el país (en Natural Earth vienen aparte). Malvinas: SIEMPRE con Argentina. */
const ANEXOS: Record<string, string> = { "Falkland Is.": "Argentina", "S. Geo. and the Is.": "Argentina" };

export type Resalte = { color: string; alto?: number; borde?: boolean };

/**
 * Mar + países a menos de `alcance` grados del centro. `resaltar`: { "Argentina": { color, alto 0→1, borde } }
 * (alto levanta el país hacia la cámara; animalo con el frame).
 */
export const Mapa3D: React.FC<{ centro?: LonLat; alcance?: number; resaltar?: Record<string, Resalte>; mar?: string }> = ({
  centro = CENTRO_AR,
  alcance = 48,
  resaltar = {},
  mar = "#08223f",
}) => {
  const paises = useMemo(() => {
    const proy = proyectar(centro);
    const rad = (alcance * Math.PI) / 180;
    return PAISES.filter((p) => geoDistance(geoCentroid(p), centro) < rad || p.properties.name in resaltar || ANEXOS[p.properties.name] in resaltar).map((p) => {
      const fs = formas(p, (ll) => proy(ll) as [number, number] | null);
      return { nombre: p.properties.name, fs, geo: extruir(fs) };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centro[0], centro[1], alcance]);
  const tierra = texturaTierra();
  return (
    <group>
      <mesh position={[0, 0, -0.01]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={mar} roughness={0.7} metalness={0} envMapIntensity={0.15} />
      </mesh>
      {paises.map(({ nombre, fs, geo }) => {
        const r = resaltar[nombre] ?? resaltar[ANEXOS[nombre]];
        const z = r ? (r.alto ?? 0) * 0.35 : 0;
        return (
          <group key={nombre} position={[0, 0, z]}>
            <mesh geometry={geo} castShadow receiveShadow>
              {r ? (
                <meshStandardMaterial color={r.color} roughness={0.6} envMapIntensity={0.35} />
              ) : (
                <meshStandardMaterial map={tierra} color="#c4cfb4" roughness={0.95} envMapIntensity={0.25} />
              )}
            </mesh>
            {r?.borde !== false && r ? <Borde fs={fs} z={GROSOR + 0.03} /> : null}
          </group>
        );
      })}
    </group>
  );
};

/**
 * Un país a TAMAÑO REAL puesto en otro lugar del mapa (para comparar superficies).
 * Se proyecta con su propio centro (áreas iguales) y se apoya en `en` (lon/lat del mapa principal).
 */
export const PaisFlotante: React.FC<{
  pais: string;
  en: LonLat;
  centro?: LonLat;
  color: string;
  alto?: number;
  rot?: number;
  escala?: number;
  opacidad?: number;
}> = ({ pais, en, centro = CENTRO_AR, color, alto = 1, rot = 0, escala = 1, opacidad = 1 }) => {
  const { fs, geo } = useMemo(() => {
    const p = paisPorNombre(pais);
    const proy = proyectar(geoCentroid(p) as LonLat);
    const fs = formas(p, (ll) => proy(ll) as [number, number] | null, 0.03);
    return { fs, geo: extruir(fs) };
  }, [pais]);
  const [x, y] = enMapa(en, centro);
  return (
    <group position={[x, y, 0.2 + alto * 0.5]} rotation={[0, 0, rot]} scale={escala}>
      <mesh geometry={geo} castShadow>
        <meshStandardMaterial color={color} roughness={0.55} envMapIntensity={0.35} transparent={opacidad < 1} opacity={opacidad} />
      </mesh>
      <Borde fs={fs} z={GROSOR + 0.03} />
    </group>
  );
};
