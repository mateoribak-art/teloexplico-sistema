import { Composition, Folder, Still } from "remotion";
import { ALTO, ANCHO } from "./kit/marca";
import { PrototipoB, PrototipoC } from "./prototipos/Granizo";
import { ArmyBomb006, DURACION as DUR_006, FPS as FPS_006, Portada006 } from "./videos/006-army-bomb/Video";
import { Bts13Anios007, DURACION as DUR_007, FPS as FPS_007, Portada007 } from "./videos/007-bts-13-anios/Video";
import { Taller } from "./taller/Taller";
import { Catalogo } from "./taller/Catalogo";
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
import { DURACION as DUR_018, FPS as FPS_018, Portada018, RefrescaTormenta018 } from "./videos/018-refresca-tormenta/Video";

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
        <Composition id="h018-refresca-tormenta" component={RefrescaTormenta018} durationInFrames={DUR_018} fps={FPS_018} width={ANCHO} height={ALTO} />
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
        <Still id="p018-refresca-tormenta" component={Portada018} width={ANCHO} height={ALTO} />
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
