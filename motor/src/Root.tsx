import { Composition, Folder, Still } from "remotion";
import { ALTO, ANCHO } from "./kit/marca";
import { PrototipoB, PrototipoC } from "./prototipos/Granizo";
import { ArmyBomb006, DURACION as DUR_006, FPS as FPS_006, Portada006 } from "./videos/006-army-bomb/Video";
import { Bts13Anios007, DURACION as DUR_007, FPS as FPS_007, Portada007 } from "./videos/007-bts-13-anios/Video";
import { Taller } from "./taller/Taller";
import { ALTO_C, ANCHO_C, CarruselPlaca } from "./carruseles/Carrusel";
import { Catalogo } from "./taller/Catalogo";
import { TallerMapa } from "./taller/TallerMapa";
import { BannerYT, BannerYTGuia } from "./taller/BannerYT";
import { Plantilla, PortadaPlantilla, calcularPlantilla, type PropsPlantilla } from "./plantilla/Plantilla";
import { DURACION as DUR_001, FPS as FPS_001, Heladera001, Portada001 } from "./videos/001-heladera/Video";
import { CorteDigestion002, DURACION as DUR_002, FPS as FPS_002, Portada002 } from "./videos/002-corte-digestion/Video";
import { DURACION as DUR_003, FPS as FPS_003, Portada003, VueltaCarne003 } from "./videos/003-vuelta-carne/Video";
import { DURACION as DUR_004, FPS as FPS_004, OlorALluvia004, Portada004 } from "./videos/004-olor-a-lluvia/Video";
import { DURACION as DUR_005, FPS as FPS_005, GranizoCalor005, Portada005 } from "./videos/005-granizo-calor/Video";
import { AireEn17008, DURACION as DUR_008, FPS as FPS_008, Portada008 } from "./videos/008-aire-en-17/Video";
import { Ventilador009, DURACION as DUR_009, FPS as FPS_009, Portada009 } from "./videos/009-ventilador-pieza-vacia/Video";

import { DURACION as DUR_012, FPS as FPS_012, LavarPollo012, Portada012 } from "./videos/012-lavar-pollo/Video";
import { CelularArroz014, DURACION as DUR_014, FPS as FPS_014, Portada014 } from "./videos/014-celular-arroz/Video";
import { DescongelarMesada015, DURACION as DUR_015, FPS as FPS_015, Portada015 } from "./videos/015-descongelar-mesada/Video";
import { DURACION as DUR_016, ElNinoClima016, FPS as FPS_016, Portada016 } from "./videos/016-el-nino-clima/Video";
import { DURACION as DUR_017, FPS as FPS_017, ParadojaCumpleanos017, Portada017 } from "./videos/017-paradoja-cumpleanos/Video";
import { DURACION as DUR_018, FPS as FPS_018, Portada018, RayoTrueno018 } from "./videos/018-rayo-trueno/Video";
import { DURACION as DUR_018R, FPS as FPS_018R, Portada018 as Portada018R, RefrescaTormenta018 } from "./videos/018-refresca-tormenta/Video";
import { DURACION as DUR_019, FPS as FPS_019, Portada019, SensacionTermica019 } from "./videos/019-sensacion-termica/Video";
import { DURACION as DUR_021, FPS as FPS_021, HeladeraParte2_021, Portada021 } from "./videos/021-heladera-parte-2/Video";
import { DURACION as DUR_022, FPS as FPS_022, Colectivo022, Portada022 } from "./videos/022-colectivo-de-a-dos/Video";
import { DURACION as DUR_020, FPS as FPS_020, PavaSeCorta3D, Portada020 } from "./videos/020-pava-se-corta/Video";
import { DURACION as DUR_023, FPS as FPS_023, PerrosColores023, Portada023 } from "./videos/023-perros-colores/Video";
import { DURACION as DUR_024, FPS as FPS_024, GranizoCorto024, Portada024 } from "./videos/024-granizo-corto/Video";
// @letmeexplain.us: slugs con "en-" (logo, cierre y serie salen solos en inglés: kit/cuenta.ts)
import { DURACION as DUR_EN002, FPS as FPS_EN002, DstFarmersEn002, PortadaEn002 } from "./videos/en-002-dst-farmers/Video";
import { DURACION as DUR_EN003, FPS as FPS_EN003, FridgeLeftoversEn003, PortadaEn003 } from "./videos/en-003-fridge-leftovers/Video";
import { DURACION as DUR_EN004, FPS as FPS_EN004, SugarHyperEn004, PortadaEn004 } from "./videos/en-004-sugar-hyper/Video";
import { DURACION as DUR_EN001, FPS as FPS_EN001, PhoneRiceEn001, PortadaEn001 } from "./videos/en-001-phone-rice/Video";

// Cada video nuevo suma su <Composition> (id "hNNN-slug") y su <Still> de portada (id "pNNN-slug").
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="videos">
        <Composition id="h001-heladera" component={Heladera001} durationInFrames={DUR_001} fps={FPS_001} width={ANCHO} height={ALTO} />
        <Composition id="h002-corte-digestion" component={CorteDigestion002} durationInFrames={DUR_002} fps={FPS_002} width={ANCHO} height={ALTO} />
        <Composition id="h003-vuelta-carne" component={VueltaCarne003} durationInFrames={DUR_003} fps={FPS_003} width={ANCHO} height={ALTO} />
        <Composition id="h004-olor-a-lluvia" component={OlorALluvia004} durationInFrames={DUR_004} fps={FPS_004} width={ANCHO} height={ALTO} />
        <Composition id="h005-granizo-calor" component={GranizoCalor005} durationInFrames={DUR_005} fps={FPS_005} width={ANCHO} height={ALTO} />
        <Composition id="h006-army-bomb" component={ArmyBomb006} durationInFrames={DUR_006} fps={FPS_006} width={ANCHO} height={ALTO} />
        <Composition id="h007-bts-13-anios" component={Bts13Anios007} durationInFrames={DUR_007} fps={FPS_007} width={ANCHO} height={ALTO} />
        <Composition id="h008-aire-en-17" component={AireEn17008} durationInFrames={DUR_008} fps={FPS_008} width={ANCHO} height={ALTO} />
        <Composition id="h009-ventilador-pieza-vacia" component={Ventilador009} durationInFrames={DUR_009} fps={FPS_009} width={ANCHO} height={ALTO} />
        <Composition id="h012-lavar-pollo" component={LavarPollo012} durationInFrames={DUR_012} fps={FPS_012} width={ANCHO} height={ALTO} />
        <Composition id="h014-celular-arroz" component={CelularArroz014} durationInFrames={DUR_014} fps={FPS_014} width={ANCHO} height={ALTO} />
        <Composition id="h015-descongelar-mesada" component={DescongelarMesada015} durationInFrames={DUR_015} fps={FPS_015} width={ANCHO} height={ALTO} />
        <Composition id="h016-el-nino-clima" component={ElNinoClima016} durationInFrames={DUR_016} fps={FPS_016} width={ANCHO} height={ALTO} />
        <Composition id="h017-paradoja-cumpleanos" component={ParadojaCumpleanos017} durationInFrames={DUR_017} fps={FPS_017} width={ANCHO} height={ALTO} />
        <Composition id="h018-rayo-trueno" component={RayoTrueno018} durationInFrames={DUR_018} fps={FPS_018} width={ANCHO} height={ALTO} />
        <Composition id="h018-refresca-tormenta" component={RefrescaTormenta018} durationInFrames={DUR_018R} fps={FPS_018R} width={ANCHO} height={ALTO} />
        <Composition id="h019-sensacion-termica" component={SensacionTermica019} durationInFrames={DUR_019} fps={FPS_019} width={ANCHO} height={ALTO} />
        <Composition id="h021-heladera-parte-2" component={HeladeraParte2_021} durationInFrames={DUR_021} fps={FPS_021} width={ANCHO} height={ALTO} />
        <Composition id="h022-colectivo-de-a-dos" component={Colectivo022} durationInFrames={DUR_022} fps={FPS_022} width={ANCHO} height={ALTO} />
        <Composition id="h020-pava-se-corta" component={PavaSeCorta3D} durationInFrames={DUR_020} fps={FPS_020} width={ANCHO} height={ALTO} />
        <Composition id="h023-perros-colores" component={PerrosColores023} durationInFrames={DUR_023} fps={FPS_023} width={ANCHO} height={ALTO} />
        <Composition id="h024-granizo-corto" component={GranizoCorto024} durationInFrames={DUR_024} fps={FPS_024} width={ANCHO} height={ALTO} />
      </Folder>
      <Folder name="en">
        <Composition id="hen-001-phone-rice" component={PhoneRiceEn001} durationInFrames={DUR_EN001} fps={FPS_EN001} width={ANCHO} height={ALTO} />
        <Still id="pen-001-phone-rice" component={PortadaEn001} width={ANCHO} height={ALTO} />
        <Composition id="hen-002-dst-farmers" component={DstFarmersEn002} durationInFrames={DUR_EN002} fps={FPS_EN002} width={ANCHO} height={ALTO} />
        <Still id="pen-002-dst-farmers" component={PortadaEn002} width={ANCHO} height={ALTO} />
        <Composition id="hen-003-fridge-leftovers" component={FridgeLeftoversEn003} durationInFrames={DUR_EN003} fps={FPS_EN003} width={ANCHO} height={ALTO} />
        <Still id="pen-003-fridge-leftovers" component={PortadaEn003} width={ANCHO} height={ALTO} />
        <Composition id="hen-004-sugar-hyper" component={SugarHyperEn004} durationInFrames={DUR_EN004} fps={FPS_EN004} width={ANCHO} height={ALTO} />
        <Still id="pen-004-sugar-hyper" component={PortadaEn004} width={ANCHO} height={ALTO} />
      </Folder>
      <Folder name="carruseles">
        <Still id="carrusel" component={CarruselPlaca} width={ANCHO_C} height={ALTO_C} defaultProps={{ datos: { origen: [], placas: [{ tipo: "cierre", texto: "placa de prueba" }] }, i: 0 }} />
      </Folder>
      <Folder name="portadas">
        <Still id="p001-heladera" component={Portada001} width={ANCHO} height={ALTO} />
        <Still id="p002-corte-digestion" component={Portada002} width={ANCHO} height={ALTO} />
        <Still id="p003-vuelta-carne" component={Portada003} width={ANCHO} height={ALTO} />
        <Still id="p004-olor-a-lluvia" component={Portada004} width={ANCHO} height={ALTO} />
        <Still id="p005-granizo-calor" component={Portada005} width={ANCHO} height={ALTO} />
        <Still id="p006-army-bomb" component={Portada006} width={ANCHO} height={ALTO} />
        <Still id="p007-bts-13-anios" component={Portada007} width={ANCHO} height={ALTO} />
        <Still id="p008-aire-en-17" component={Portada008} width={ANCHO} height={ALTO} />
        <Still id="p009-ventilador-pieza-vacia" component={Portada009} width={ANCHO} height={ALTO} />
        <Still id="p012-lavar-pollo" component={Portada012} width={ANCHO} height={ALTO} />
        <Still id="p014-celular-arroz" component={Portada014} width={ANCHO} height={ALTO} />
        <Still id="p015-descongelar-mesada" component={Portada015} width={ANCHO} height={ALTO} />
        <Still id="p016-el-nino-clima" component={Portada016} width={ANCHO} height={ALTO} />
        <Still id="p017-paradoja-cumpleanos" component={Portada017} width={ANCHO} height={ALTO} />
        <Still id="p018-rayo-trueno" component={Portada018} width={ANCHO} height={ALTO} />
        <Still id="p018-refresca-tormenta" component={Portada018R} width={ANCHO} height={ALTO} />
        <Still id="p019-sensacion-termica" component={Portada019} width={ANCHO} height={ALTO} />
        <Still id="p021-heladera-parte-2" component={Portada021} width={ANCHO} height={ALTO} />
        <Still id="p022-colectivo-de-a-dos" component={Portada022} width={ANCHO} height={ALTO} />
        <Still id="p020-pava-se-corta" component={Portada020} width={ANCHO} height={ALTO} />
        <Still id="p023-perros-colores" component={Portada023} width={ANCHO} height={ALTO} />
        <Still id="p024-granizo-corto" component={Portada024} width={ANCHO} height={ALTO} />
      </Folder>
      {/* plan B (sin Claude): herramientas/plan_b.py le pasa las escenas con --props */}
      <Folder name="planb">
        <Composition id="plantilla" component={Plantilla} durationInFrames={300} fps={30} width={ANCHO} height={ALTO}
          defaultProps={{ slug: "005-granizo-calor", escenas: [] } as PropsPlantilla} calculateMetadata={calcularPlantilla} />
        <Still id="plantillaPortada" component={PortadaPlantilla} width={ANCHO} height={ALTO}
          defaultProps={{ slug: "", escenas: [], portada: { arriba: "¿pregunta?", grande: "respuesta", sello: "DATO", objeto: "sol" } } as PropsPlantilla} />
      </Folder>
      <Folder name="taller">
        <Still id="taller" component={Taller} width={1600} height={1000} />
        <Still id="catalogo" component={Catalogo} width={2400} height={1600} />
        <Still id="tallerMapa" component={TallerMapa} width={ANCHO} height={ALTO} />
        <Still id="bannerYT" component={BannerYT} width={2560} height={1440} />
        <Still id="bannerYTGuia" component={BannerYTGuia} width={2560} height={1440} />
      </Folder>
      <Folder name="prototipos">
        <Still id="protoB" component={PrototipoB} width={ANCHO} height={ALTO} />
        <Still id="protoC" component={PrototipoC} width={ANCHO} height={ALTO} />
      </Folder>
    </>
  );
};
