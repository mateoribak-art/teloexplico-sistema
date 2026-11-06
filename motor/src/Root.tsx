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
import { DURACION as DUR_025, FPS as FPS_025, NoquisDel29, Portada025 } from "./videos/025-noquis-del-29/Video";
import { DURACION as DUR_010, FPS as FPS_010, RayoMismoLugar3D, Portada010 } from "./videos/010-rayo-mismo-lugar/Video";
import { DURACION as DUR_DEMO_HORA, FPS as FPS_DEMO_HORA, HoraCorrida3D } from "./videos/demo-hora-corrida/Video";
import { DURACION as DUR_027, FPS as FPS_027, BondiDeBrasil3D, Portada027 } from "./videos/027-bondi-de-brasil/Video";
import { DURACION as DUR_026, FPS as FPS_026, MediodiaHoraCorrida3D, Portada026 } from "./videos/026-mediodia-hora-corrida/Video";
import { DURACION as DUR_028, FPS as FPS_028, YerbaPorAno3D, Portada028 } from "./videos/028-yerba-por-ano/Video";
import { DURACION as DUR_029, FPS as FPS_029, CataratasPorSegundo3D, Portada029 } from "./videos/029-cataratas-por-segundo/Video";
import { DURACION as DUR_030, FPS as FPS_030, FilaDelSuper3D, Portada030 } from "./videos/030-fila-del-super/Video";
import { DURACION as DUR_031, FPS as FPS_031, MurcielagoCiego3D, Portada031 } from "./videos/031-murcielago-ciego/Video";
import { DURACION as DUR_013, FPS as FPS_013, AlcoholCalor3D, Portada013 } from "./videos/013-alcohol-calor/Video";
import { DURACION as DUR_032, FPS as FPS_032, PeloMojado3D, Portada032 } from "./videos/032-pelo-mojado-resfrio/Video";
import { DURACION as DUR_033, FPS as FPS_033, GraciasMate3D, Portada033 } from "./videos/033-gracias-en-el-mate/Video";
import { DURACION as DUR_034, FPS as FPS_034, ArrozRecalentado3D, Portada034 } from "./videos/034-arroz-recalentado/Video";
import { DURACION as DUR_035, FPS as FPS_035, LavandinaVinagre3D, Portada035 } from "./videos/035-lavandina-vinagre/Video";
import { DURACION as DUR_036, FPS as FPS_036, ApagonHeladera3D, Portada036 } from "./videos/036-apagon-heladera/Video";
import { DURACION as DUR_037, FPS as FPS_037, PerroEnElAuto3D, Portada037 } from "./videos/037-perro-en-el-auto/Video";
import { DURACION as DUR_038, FPS as FPS_038, CodigoWhatsapp3D, Portada038 } from "./videos/038-codigo-whatsapp/Video";
import { DURACION as DUR_039, FPS as FPS_039, SolNublado3D, Portada039 } from "./videos/039-sol-nublado/Video";
import { DURACION as DUR_040, FPS as FPS_040, ConsumoFantasma3D, Portada040 } from "./videos/040-consumo-fantasma/Video";
import { DURACION as DUR_041, FPS as FPS_041, CelularArroz041, Portada041 } from "./videos/041-celular-arroz-v2/Video";
import { DURACION as DUR_023, FPS as FPS_023, PerrosColores023, Portada023 } from "./videos/023-perros-colores/Video";
import { DURACION as DUR_024, FPS as FPS_024, GranizoCorto024, Portada024 } from "./videos/024-granizo-corto/Video";
import { DURACION as DUR_011, FPS as FPS_011, SalAgua011, Portada011 } from "./videos/011-sal-agua-hierve/Video";
// @letmeexplain.us: slugs con "en-" (logo, cierre y serie salen solos en inglés: kit/cuenta.ts)
import { DURACION as DUR_EN002, FPS as FPS_EN002, DstFarmersEn002, PortadaEn002 } from "./videos/en-002-dst-farmers/Video";
import { DURACION as DUR_EN003, FPS as FPS_EN003, FridgeLeftoversEn003, PortadaEn003 } from "./videos/en-003-fridge-leftovers/Video";
import { DURACION as DUR_EN004, FPS as FPS_EN004, SugarHyperEn004, PortadaEn004 } from "./videos/en-004-sugar-hyper/Video";
import { DURACION as DUR_EN005, FPS as FPS_EN005, FridgePart2En005, PortadaEn005 } from "./videos/en-005-fridge-part-2/Video";
import { DURACION as DUR_EN006, FPS as FPS_EN006, FiveSecondEn006, PortadaEn006 } from "./videos/en-006-five-second-rule/Video";
import { DURACION as DUR_EN007, FPS as FPS_EN007, FlipSteakEn007, PortadaEn007 } from "./videos/en-007-flip-steak/Video";
import { DURACION as DUR_EN008, FPS as FPS_EN008, WashChickenEn008, PortadaEn008 } from "./videos/en-008-wash-chicken/Video";
import { DURACION as DUR_EN009, FPS as FPS_EN009, CeilingFanEn009, PortadaEn009 } from "./videos/en-009-ceiling-fan/Video";
import { DURACION as DUR_EN010, FPS as FPS_EN010, ThermostatNightEn010, PortadaEn010 } from "./videos/en-010-thermostat-night/Video";
import { DURACION as DUR_EN011, FPS as FPS_EN011, ThawCounterEn011, PortadaEn011 } from "./videos/en-011-thaw-counter/Video";
import { DURACION as DUR_EN012, FPS as FPS_EN012, ThunderCountEn012, PortadaEn012 } from "./videos/en-012-thunder-count/Video";
import { DURACION as DUR_EN013, FPS as FPS_EN013, SearingJuicesEn013, PortadaEn013 } from "./videos/en-013-searing-juices/Video";
import { DURACION as DUR_EN014, FPS as FPS_EN014, BirthdayPairsEn014, PortadaEn014 } from "./videos/en-014-birthday-pairs/Video";
import { DURACION as DUR_EN015, FPS as FPS_EN015, RainSmellEn015, PortadaEn015 } from "./videos/en-015-rain-smell/Video";
import { DURACION as DUR_EN016, FPS as FPS_EN016, TooColdSnowEn016, PortadaEn016 } from "./videos/en-016-too-cold-snow/Video";
import { DURACION as DUR_EN017, FPS as FPS_EN017, HeatHeadEn017, PortadaEn017 } from "./videos/en-017-heat-head/Video";
import { DURACION as DUR_EN018, FPS as FPS_EN018, StormCooldownEn018, PortadaEn018 } from "./videos/en-018-storm-cooldown/Video";
import { DURACION as DUR_EN019, FPS as FPS_EN019, KnuckleCrackEn019, PortadaEn019 } from "./videos/en-019-knuckle-crack/Video";
import { DURACION as DUR_EN020, FPS as FPS_EN020, AcSixtyEn020, PortadaEn020 } from "./videos/en-020-ac-sixty/Video";
import { DURACION as DUR_EN021,FPS as FPS_EN021, OtherLineEn021, PortadaEn021 } from "./videos/en-021-other-line/Video";
import { DURACION as DUR_EN022, FPS as FPS_EN022, PowerOutageEn022, PortadaEn022 } from "./videos/en-022-power-outage-fridge/Video";
import { DURACION as DUR_EN023, FPS as FPS_EN023, PackageTextEn023, PortadaEn023 } from "./videos/en-023-package-text/Video";
import { DURACION as DUR_EN024, FPS as FPS_EN024, HeatIndexEn024, PortadaEn024 } from "./videos/en-024-heat-index/Video";
import { DURACION as DUR_EN025, FPS as FPS_EN025, DogHotCarEn025, PortadaEn025 } from "./videos/en-025-dog-hot-car/Video";
import { DURACION as DUR_EN026, FPS as FPS_EN026, ElNinoWinterEn026, PortadaEn026 } from "./videos/en-026-el-nino-winter/Video";
import { DURACION as DUR_EN001,FPS as FPS_EN001, PhoneRiceEn001, PortadaEn001 } from "./videos/en-001-phone-rice/Video";

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
        <Composition id="h025-noquis-del-29" component={NoquisDel29} durationInFrames={DUR_025} fps={FPS_025} width={ANCHO} height={ALTO} />
        <Composition id="h010-rayo-mismo-lugar" component={RayoMismoLugar3D} durationInFrames={DUR_010} fps={FPS_010} width={ANCHO} height={ALTO} />
        <Composition id="h027-bondi-de-brasil" component={BondiDeBrasil3D} durationInFrames={DUR_027} fps={FPS_027} width={ANCHO} height={ALTO} />
        <Composition id="h028-yerba-por-ano" component={YerbaPorAno3D} durationInFrames={DUR_028} fps={FPS_028} width={ANCHO} height={ALTO} />
        <Composition id="h029-cataratas-por-segundo" component={CataratasPorSegundo3D} durationInFrames={DUR_029} fps={FPS_029} width={ANCHO} height={ALTO} />
        <Composition id="h030-fila-del-super" component={FilaDelSuper3D} durationInFrames={DUR_030} fps={FPS_030} width={ANCHO} height={ALTO} />
        <Composition id="h031-murcielago-ciego" component={MurcielagoCiego3D} durationInFrames={DUR_031} fps={FPS_031} width={ANCHO} height={ALTO} />
        <Composition id="h013-alcohol-calor" component={AlcoholCalor3D} durationInFrames={DUR_013} fps={FPS_013} width={ANCHO} height={ALTO} />
        <Composition id="h032-pelo-mojado-resfrio" component={PeloMojado3D} durationInFrames={DUR_032} fps={FPS_032} width={ANCHO} height={ALTO} />
        <Still id="p032-pelo-mojado-resfrio" component={Portada032} width={ANCHO} height={ALTO} />
        <Composition id="h033-gracias-en-el-mate" component={GraciasMate3D} durationInFrames={DUR_033} fps={FPS_033} width={ANCHO} height={ALTO} />
        <Still id="p033-gracias-en-el-mate" component={Portada033} width={ANCHO} height={ALTO} />
        <Composition id="h034-arroz-recalentado" component={ArrozRecalentado3D} durationInFrames={DUR_034} fps={FPS_034} width={ANCHO} height={ALTO} />
        <Still id="p034-arroz-recalentado" component={Portada034} width={ANCHO} height={ALTO} />
        <Composition id="h035-lavandina-vinagre" component={LavandinaVinagre3D} durationInFrames={DUR_035} fps={FPS_035} width={ANCHO} height={ALTO} />
        <Still id="p035-lavandina-vinagre" component={Portada035} width={ANCHO} height={ALTO} />
        <Composition id="h036-apagon-heladera" component={ApagonHeladera3D} durationInFrames={DUR_036} fps={FPS_036} width={ANCHO} height={ALTO} />
        <Still id="p036-apagon-heladera" component={Portada036} width={ANCHO} height={ALTO} />
        <Composition id="h037-perro-en-el-auto" component={PerroEnElAuto3D} durationInFrames={DUR_037} fps={FPS_037} width={ANCHO} height={ALTO} />
        <Still id="p037-perro-en-el-auto" component={Portada037} width={ANCHO} height={ALTO} />
        <Composition id="h038-codigo-whatsapp" component={CodigoWhatsapp3D} durationInFrames={DUR_038} fps={FPS_038} width={ANCHO} height={ALTO} />
        <Still id="p038-codigo-whatsapp" component={Portada038} width={ANCHO} height={ALTO} />
        <Composition id="h039-sol-nublado" component={SolNublado3D} durationInFrames={DUR_039} fps={FPS_039} width={ANCHO} height={ALTO} />
        <Still id="p039-sol-nublado" component={Portada039} width={ANCHO} height={ALTO} />
        <Composition id="h040-consumo-fantasma" component={ConsumoFantasma3D} durationInFrames={DUR_040} fps={FPS_040} width={ANCHO} height={ALTO} />
        <Still id="p040-consumo-fantasma" component={Portada040} width={ANCHO} height={ALTO} />
        <Composition id="h041-celular-arroz-v2" component={CelularArroz041} durationInFrames={DUR_041} fps={FPS_041} width={ANCHO} height={ALTO} />
        <Still id="p041-celular-arroz-v2" component={Portada041} width={ANCHO} height={ALTO} />
        <Composition id="h026-mediodia-hora-corrida" component={MediodiaHoraCorrida3D} durationInFrames={DUR_026} fps={FPS_026} width={ANCHO} height={ALTO} />
        <Composition id="demo-hora-corrida" component={HoraCorrida3D} durationInFrames={DUR_DEMO_HORA} fps={FPS_DEMO_HORA} width={ANCHO} height={ALTO} />
        <Composition id="h023-perros-colores" component={PerrosColores023} durationInFrames={DUR_023} fps={FPS_023} width={ANCHO} height={ALTO} />
        <Composition id="h024-granizo-corto" component={GranizoCorto024} durationInFrames={DUR_024} fps={FPS_024} width={ANCHO} height={ALTO} />
        <Composition id="h011-sal-agua-hierve" component={SalAgua011} durationInFrames={DUR_011} fps={FPS_011} width={ANCHO} height={ALTO} />
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
        <Composition id="hen-005-fridge-part-2" component={FridgePart2En005} durationInFrames={DUR_EN005} fps={FPS_EN005} width={ANCHO} height={ALTO} />
        <Still id="pen-005-fridge-part-2" component={PortadaEn005} width={ANCHO} height={ALTO} />
        <Composition id="hen-006-five-second-rule" component={FiveSecondEn006} durationInFrames={DUR_EN006} fps={FPS_EN006} width={ANCHO} height={ALTO} />
        <Still id="pen-006-five-second-rule" component={PortadaEn006} width={ANCHO} height={ALTO} />
        <Composition id="hen-007-flip-steak" component={FlipSteakEn007} durationInFrames={DUR_EN007} fps={FPS_EN007} width={ANCHO} height={ALTO} />
        <Still id="pen-007-flip-steak" component={PortadaEn007} width={ANCHO} height={ALTO} />
        <Composition id="hen-008-wash-chicken" component={WashChickenEn008} durationInFrames={DUR_EN008} fps={FPS_EN008} width={ANCHO} height={ALTO} />
        <Still id="pen-008-wash-chicken" component={PortadaEn008} width={ANCHO} height={ALTO} />
        <Composition id="hen-009-ceiling-fan" component={CeilingFanEn009} durationInFrames={DUR_EN009} fps={FPS_EN009} width={ANCHO} height={ALTO} />
        <Still id="pen-009-ceiling-fan" component={PortadaEn009} width={ANCHO} height={ALTO} />
        <Composition id="hen-010-thermostat-night" component={ThermostatNightEn010} durationInFrames={DUR_EN010} fps={FPS_EN010} width={ANCHO} height={ALTO} />
        <Still id="pen-010-thermostat-night" component={PortadaEn010} width={ANCHO} height={ALTO} />
        <Composition id="hen-011-thaw-counter" component={ThawCounterEn011} durationInFrames={DUR_EN011} fps={FPS_EN011} width={ANCHO} height={ALTO} />
        <Still id="pen-011-thaw-counter" component={PortadaEn011} width={ANCHO} height={ALTO} />
        <Composition id="hen-012-thunder-count" component={ThunderCountEn012} durationInFrames={DUR_EN012} fps={FPS_EN012} width={ANCHO} height={ALTO} />
        <Still id="pen-012-thunder-count" component={PortadaEn012} width={ANCHO} height={ALTO} />
        <Composition id="hen-013-searing-juices" component={SearingJuicesEn013} durationInFrames={DUR_EN013} fps={FPS_EN013} width={ANCHO} height={ALTO} />
        <Still id="pen-013-searing-juices" component={PortadaEn013} width={ANCHO} height={ALTO} />
        <Composition id="hen-014-birthday-pairs" component={BirthdayPairsEn014} durationInFrames={DUR_EN014} fps={FPS_EN014} width={ANCHO} height={ALTO} />
        <Still id="pen-014-birthday-pairs" component={PortadaEn014} width={ANCHO} height={ALTO} />
        <Composition id="hen-015-rain-smell" component={RainSmellEn015} durationInFrames={DUR_EN015} fps={FPS_EN015} width={ANCHO} height={ALTO} />
        <Still id="pen-015-rain-smell" component={PortadaEn015} width={ANCHO} height={ALTO} />
        <Composition id="hen-016-too-cold-snow" component={TooColdSnowEn016} durationInFrames={DUR_EN016} fps={FPS_EN016} width={ANCHO} height={ALTO} />
        <Still id="pen-016-too-cold-snow" component={PortadaEn016} width={ANCHO} height={ALTO} />
        <Composition id="hen-017-heat-head" component={HeatHeadEn017} durationInFrames={DUR_EN017} fps={FPS_EN017} width={ANCHO} height={ALTO} />
        <Still id="pen-017-heat-head" component={PortadaEn017} width={ANCHO} height={ALTO} />
        <Composition id="hen-018-storm-cooldown" component={StormCooldownEn018} durationInFrames={DUR_EN018} fps={FPS_EN018} width={ANCHO} height={ALTO} />
        <Still id="pen-018-storm-cooldown" component={PortadaEn018} width={ANCHO} height={ALTO} />
        <Composition id="hen-019-knuckle-crack" component={KnuckleCrackEn019} durationInFrames={DUR_EN019} fps={FPS_EN019} width={ANCHO} height={ALTO} />
        <Still id="pen-019-knuckle-crack" component={PortadaEn019} width={ANCHO} height={ALTO} />
        <Composition id="hen-020-ac-sixty" component={AcSixtyEn020} durationInFrames={DUR_EN020} fps={FPS_EN020} width={ANCHO} height={ALTO} />
        <Still id="pen-020-ac-sixty" component={PortadaEn020} width={ANCHO} height={ALTO} />
        <Composition id="hen-021-other-line" component={OtherLineEn021} durationInFrames={DUR_EN021} fps={FPS_EN021} width={ANCHO} height={ALTO} />
        <Still id="pen-021-other-line" component={PortadaEn021} width={ANCHO} height={ALTO} />
        <Composition id="hen-022-power-outage-fridge" component={PowerOutageEn022} durationInFrames={DUR_EN022} fps={FPS_EN022} width={ANCHO} height={ALTO} />
        <Still id="pen-022-power-outage-fridge" component={PortadaEn022} width={ANCHO} height={ALTO} />
        <Composition id="hen-023-package-text" component={PackageTextEn023} durationInFrames={DUR_EN023} fps={FPS_EN023} width={ANCHO} height={ALTO} />
        <Still id="pen-023-package-text" component={PortadaEn023} width={ANCHO} height={ALTO} />
        <Composition id="hen-024-heat-index" component={HeatIndexEn024} durationInFrames={DUR_EN024} fps={FPS_EN024} width={ANCHO} height={ALTO} />
        <Still id="pen-024-heat-index" component={PortadaEn024} width={ANCHO} height={ALTO} />
        <Composition id="hen-025-dog-hot-car" component={DogHotCarEn025} durationInFrames={DUR_EN025} fps={FPS_EN025} width={ANCHO} height={ALTO} />
        <Still id="pen-025-dog-hot-car" component={PortadaEn025} width={ANCHO} height={ALTO} />
        <Composition id="hen-026-el-nino-winter" component={ElNinoWinterEn026} durationInFrames={DUR_EN026} fps={FPS_EN026} width={ANCHO} height={ALTO} />
        <Still id="pen-026-el-nino-winter" component={PortadaEn026} width={ANCHO} height={ALTO} />
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
        <Still id="p025-noquis-del-29" component={Portada025} width={ANCHO} height={ALTO} />        <Still id="p027-bondi-de-brasil" component={Portada027} width={ANCHO} height={ALTO} />
        <Still id="p028-yerba-por-ano" component={Portada028} width={ANCHO} height={ALTO} />
        <Still id="p029-cataratas-por-segundo" component={Portada029} width={ANCHO} height={ALTO} />
        <Still id="p030-fila-del-super" component={Portada030} width={ANCHO} height={ALTO} />
        <Still id="p031-murcielago-ciego" component={Portada031} width={ANCHO} height={ALTO} />
        <Still id="p013-alcohol-calor" component={Portada013} width={ANCHO} height={ALTO} />
        <Still id="p026-mediodia-hora-corrida" component={Portada026} width={ANCHO} height={ALTO} />
        <Still id="p010-rayo-mismo-lugar" component={Portada010} width={ANCHO} height={ALTO} />
        <Still id="p023-perros-colores" component={Portada023} width={ANCHO} height={ALTO} />
        <Still id="p024-granizo-corto" component={Portada024} width={ANCHO} height={ALTO} />
        <Still id="p011-sal-agua-hierve" component={Portada011} width={ANCHO} height={ALTO} />
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
