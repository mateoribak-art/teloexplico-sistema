import React from "react";
import { Estudio } from "../kit3d/Estudio";
import { Camara } from "../kit3d/camara";
import { Mapa3D, PaisFlotante } from "../kit3d/Mapa3D";
import { ACENTO } from "../kit3d/textos";

// Prueba del mapa 3D real: Argentina resaltada y España a tamaño real apoyada encima.
export const TallerMapa: React.FC = () => (
  <Estudio>
    <Camara tomas={[{ f: 0, pos: [0.6, -3.2, 13], mira: [0.2, -0.2, 0], fov: 34 }]} />
    <Mapa3D resaltar={{ Argentina: { color: "#5b9be6", alto: 0.3 } }} />
    <PaisFlotante pais="Spain" en={[-63, -31]} color={ACENTO} alto={0.6} />
    {/* */}<PaisFlotante pais="United Kingdom" en={[-69, -49]} color="#e0525b" alto={0.6} />
  </Estudio>
);
