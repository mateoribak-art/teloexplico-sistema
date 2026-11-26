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
import { DURACION as DUR_048, FPS as FPS_048, GolpeDeCalor3D, Portada048 } from "./videos/048-golpe-de-calor/Video";
import { DURACION as DUR_046, FPS as FPS_046, PerroNoComas3D, Portada046 } from "./videos/046-perro-no-comas/Video";
import { DURACION as DUR_037,FPS as FPS_037, PerroEnElAuto3D, Portada037 } from "./videos/037-perro-en-el-auto/Video";
import { DURACION as DUR_047, FPS as FPS_047, PaqueteRetenido3D, Portada047 } from "./videos/047-paquete-retenido/Video";
import { DURACION as DUR_049, FPS as FPS_049, PrimerCalorAclimatacion3D, Portada049 } from "./videos/049-primer-calor-aclimatacion/Video";
import { DURACION as DUR_050, FPS as FPS_050, Martes13NoViernes3D, Portada050 } from "./videos/050-martes-13-no-viernes/Video";
import { DURACION as DUR_051, FPS as FPS_051, LeonidasGrano3D, Portada051 } from "./videos/051-leonidas-grano-arena/Video";
import { DURACION as DUR_052, FPS as FPS_052, ZapatillaSobrecarga3D, Portada052 } from "./videos/052-zapatilla-sobrecarga/Video";
import { DURACION as DUR_053, FPS as FPS_053, CadenasParana3D, Portada053 } from "./videos/053-cadenas-parana/Video";
import { DURACION as DUR_057, FPS as FPS_057, Ruta40Punta3D, Portada057 } from "./videos/057-ruta-40-de-punta-a-punta/Video";
import { DURACION as DUR_058, FPS as FPS_058, AguaMate3D, Portada058 } from "./videos/058-agua-del-mate/Video";
import { DURACION as DUR_059, FPS as FPS_059, PibeChangoGuri3D, Portada059 } from "./videos/059-pibe-chango-guri/Video";
import { DURACION as DUR_061, FPS as FPS_061, HeladeraTermometro3D, Portada061 } from "./videos/061-heladera-termometro/Video";
import { DURACION as DUR_074, FPS as FPS_074, AfeitarPeloGrueso3D, Portada074 } from "./videos/074-afeitar-pelo-grueso/Video";
import { DURACION as DUR_076, FPS as FPS_076, CalentarElAuto3D, Portada076 } from "./videos/076-calentar-el-auto/Video";
import { DURACION as DUR_077, FPS as FPS_077, ApellidosGonzalez3D, Portada077 } from "./videos/077-apellidos-gonzalez/Video";
import { DURACION as DUR_075, FPS as FPS_075, ParabrisasEmpanado3D, Portada075 } from "./videos/075-parabrisas-empanado/Video";
import { DURACION as DUR_064,FPS as FPS_064, NudillosArtritis3D, Portada064 } from "./videos/064-nudillos-artritis/Video";
import { DURACION as DUR_062,FPS as FPS_062, PoteMicroondas3D, Portada062 } from "./videos/062-pote-microondas/Video";
import { DURACION as DUR_065, FPS as FPS_065, VoseoVosOTu3D, Portada065 } from "./videos/065-voseo-vos-o-tu/Video";
import { DURACION as DUR_066, FPS as FPS_066, BilletesAnimales3D, Portada066 } from "./videos/066-billetes-animales/Video";
import { DURACION as DUR_067, FPS as FPS_067, DulceDeLeche3D, Portada067 } from "./videos/067-dulce-de-leche-origen/Video";
import { DURACION as DUR_068, FPS as FPS_068, Superluna3D, Portada068 } from "./videos/068-superluna-no-tan-grande/Video";
import { DURACION as DUR_069, FPS as FPS_069, Chicle3D069, Portada069 } from "./videos/069-chicle-siete-anios/Video";
import { DURACION as DUR_070, FPS as FPS_070, RayoLluvia3D070, Portada070 } from "./videos/070-rayo-despues-lluvia/Video";
import { DURACION as DUR_071, FPS as FPS_071, Pecera3D071, Portada071 } from "./videos/071-peces-memoria/Video";
import { DURACION as DUR_072, FPS as FPS_072, Cerebro3D072, Portada072 } from "./videos/072-diez-por-ciento-cerebro/Video";
import { DURACION as DUR_073, FPS as FPS_073, Muralla3D073, Portada073 } from "./videos/073-muralla-desde-espacio/Video";
import { DURACION as DUR_063, FPS as FPS_063, CheOrigen3D, Portada063 } from "./videos/063-che-origen/Video";
import { DURACION as DUR_060,FPS as FPS_060, CargaNoche3D, Portada060 } from "./videos/060-celular-carga-noche/Video";
import { DURACION as DUR_056,FPS as FPS_056, GtaTreceAnios3D, Portada056 } from "./videos/056-gta-trece-anios/Video";
import { DURACION as DUR_055, FPS as FPS_055, GtaViceCityMiami3D, Portada055 } from "./videos/055-gta-vice-city-miami/Video";
import { DURACION as DUR_054, FPS as FPS_054, GtaJuegosViolentos3D, Portada054 } from "./videos/054-gta-juegos-violentos/Video";
import { DURACION as DUR_038,FPS as FPS_038, CodigoWhatsapp3D, Portada038 } from "./videos/038-codigo-whatsapp/Video";
import { DURACION as DUR_039, FPS as FPS_039, SolNublado3D, Portada039 } from "./videos/039-sol-nublado/Video";
import { DURACION as DUR_040, FPS as FPS_040, ConsumoFantasma3D, Portada040 } from "./videos/040-consumo-fantasma/Video";
import { DURACION as DUR_042, FPS as FPS_042, LaburoItaliano3D, Portada042 } from "./videos/042-laburo-italiano/Video";
import { DURACION as DUR_043, FPS as FPS_043, FeriadosVisita3D, Portada043 } from "./videos/043-feriados-visita/Video";
import { DURACION as DUR_045, FPS as FPS_045, UnaSolaTabla3D, Portada045 } from "./videos/045-una-sola-tabla/Video";
import { DURACION as DUR_044, FPS as FPS_044, MisaFabricaAviones3D, Portada044 } from "./videos/044-misa-fabrica-aviones/Video";
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
import { DURACION as DUR_EN033, FPS as FPS_EN033, TurkeyThawEn033, PortadaEn033 } from "./videos/en-033-turkey-thaw/Video";
import { DURACION as DUR_EN043, FPS as FPS_EN043, CoffeeMathEn043, PortadaEn043 } from "./videos/en-043-coffee-math/Video";
import { DURACION as DUR_EN050, FPS as FPS_EN050, StackedDiscountsEn050, PortadaEn050 } from "./videos/en-050-stacked-discounts/Video";
import { DURACION as DUR_EN051, FPS as FPS_EN051, ReheatedRiceEn051, PortadaEn051 } from "./videos/en-051-reheated-rice/Video";
import { DURACION as DUR_EN044, FPS as FPS_EN044, WetHairEn044, PortadaEn044 } from "./videos/en-044-wet-hair/Video";
import { DURACION as DUR_EN045, FPS as FPS_EN045, CarWarmupEn045, PortadaEn045 } from "./videos/en-045-car-warmup/Video";
import { DURACION as DUR_EN046, FPS as FPS_EN046, WindChillEn046, PortadaEn046 } from "./videos/en-046-wind-chill/Video";
import { DURACION as DUR_EN047, FPS as FPS_EN047, DogPeopleFoodEn047, PortadaEn047 } from "./videos/en-047-dog-people-food/Video";
import { DURACION as DUR_EN048, FPS as FPS_EN048, EggsFridgeEn048, PortadaEn048 } from "./videos/en-048-eggs-fridge/Video";
import { DURACION as DUR_EN049, FPS as FPS_EN049, SpaceHeaterEn049, PortadaEn049 } from "./videos/en-049-space-heater/Video";
import { DURACION as DUR_EN041,FPS as FPS_EN041, PastaOilEn041, PortadaEn041 } from "./videos/en-041-pasta-oil/Video";
import { DURACION as DUR_EN042, FPS as FPS_EN042, FrozenPipesEn042, PortadaEn042 } from "./videos/en-042-frozen-pipes/Video";
import { DURACION as DUR_EN034, FPS as FPS_EN034, AlcoholEn034, PortadaEn034 } from "./videos/en-034-alcohol-cook-off/Video";
import { DURACION as DUR_EN035, FPS as FPS_EN035, StuffingEn035, PortadaEn035 } from "./videos/en-035-turkey-stuffing/Video";
import { DURACION as DUR_EN036, FPS as FPS_EN036, PhantomEn036, PortadaEn036 } from "./videos/en-036-phantom-charger/Video";
import { DURACION as DUR_EN037, FPS as FPS_EN037, GumEn037, PortadaEn037 } from "./videos/en-037-swallowed-gum/Video";
import { DURACION as DUR_EN011,FPS as FPS_EN011, ThawCounterEn011, PortadaEn011 } from "./videos/en-011-thaw-counter/Video";
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
import { DURACION as DUR_EN027, FPS as FPS_EN027, BleachVinegarEn027, PortadaEn027 } from "./videos/en-027-bleach-vinegar/Video";
import { DURACION as DUR_EN025, FPS as FPS_EN025, DogHotCarEn025, PortadaEn025 } from "./videos/en-025-dog-hot-car/Video";
import { DURACION as DUR_EN038, FPS as FPS_EN038, LakeEffectSnowEn038, PortadaEn038 } from "./videos/en-038-lake-effect-snow/Video";
import { DURACION as DUR_EN039, FPS as FPS_EN039, PolarVortexEn039, PortadaEn039 } from "./videos/en-039-polar-vortex/Video";
import { DURACION as DUR_EN040, FPS as FPS_EN040, PowerballOddsEn040, PortadaEn040 } from "./videos/en-040-powerball-odds/Video";
import { DURACION as DUR_EN026,FPS as FPS_EN026, ElNinoWinterEn026, PortadaEn026 } from "./videos/en-026-el-nino-winter/Video";
import { DURACION as DUR_EN028, FPS as FPS_EN028, TurkeySleepyEn028, PortadaEn028 } from "./videos/en-028-turkey-sleepy/Video";
import { DURACION as DUR_EN029, FPS as FPS_EN029, SwimAfterEatingEn029, PortadaEn029 } from "./videos/en-029-swim-after-eating/Video";
import { DURACION as DUR_EN030, FPS as FPS_EN030, ViolentGamesEn030, PortadaEn030 } from "./videos/en-030-violent-games/Video";
import { DURACION as DUR_EN031, FPS as FPS_EN031, GtaViceCityEn031, PortadaEn031 } from "./videos/en-031-gta-vice-city/Video";
import { DURACION as DUR_EN032, FPS as FPS_EN032, GtaThirteenEn032, PortadaEn032 } from "./videos/en-032-gta-13-years/Video";
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
        <Composition id="h046-perro-no-comas" component={PerroNoComas3D} durationInFrames={DUR_046} fps={FPS_046} width={ANCHO} height={ALTO} />
        <Still id="p046-perro-no-comas" component={Portada046} width={ANCHO} height={ALTO} />
        <Composition id="h048-golpe-de-calor" component={GolpeDeCalor3D} durationInFrames={DUR_048} fps={FPS_048} width={ANCHO} height={ALTO} />
        <Still id="p048-golpe-de-calor" component={Portada048} width={ANCHO} height={ALTO} />
        <Composition id="h047-paquete-retenido" component={PaqueteRetenido3D} durationInFrames={DUR_047} fps={FPS_047} width={ANCHO} height={ALTO} />
        <Still id="p047-paquete-retenido" component={Portada047} width={ANCHO} height={ALTO} />
        <Composition id="h049-primer-calor-aclimatacion" component={PrimerCalorAclimatacion3D} durationInFrames={DUR_049} fps={FPS_049} width={ANCHO} height={ALTO} />
        <Still id="p049-primer-calor-aclimatacion" component={Portada049} width={ANCHO} height={ALTO} />
        <Composition id="h050-martes-13-no-viernes" component={Martes13NoViernes3D} durationInFrames={DUR_050} fps={FPS_050} width={ANCHO} height={ALTO} />
        <Still id="p050-martes-13-no-viernes" component={Portada050} width={ANCHO} height={ALTO} />
        <Composition id="h051-leonidas-grano-arena" component={LeonidasGrano3D} durationInFrames={DUR_051} fps={FPS_051} width={ANCHO} height={ALTO} />
        <Still id="p051-leonidas-grano-arena" component={Portada051} width={ANCHO} height={ALTO} />
        <Composition id="h052-zapatilla-sobrecarga" component={ZapatillaSobrecarga3D} durationInFrames={DUR_052} fps={FPS_052} width={ANCHO} height={ALTO} />
        <Still id="p052-zapatilla-sobrecarga" component={Portada052} width={ANCHO} height={ALTO} />
        <Composition id="h053-cadenas-parana" component={CadenasParana3D} durationInFrames={DUR_053} fps={FPS_053} width={ANCHO} height={ALTO} />
        <Still id="p053-cadenas-parana" component={Portada053} width={ANCHO} height={ALTO} />
        <Composition id="h054-gta-juegos-violentos" component={GtaJuegosViolentos3D} durationInFrames={DUR_054} fps={FPS_054} width={ANCHO} height={ALTO} />
        <Still id="p054-gta-juegos-violentos" component={Portada054} width={ANCHO} height={ALTO} />
        <Composition id="h057-ruta-40-de-punta-a-punta" component={Ruta40Punta3D} durationInFrames={DUR_057} fps={FPS_057} width={ANCHO} height={ALTO} />
        <Still id="p057-ruta-40-de-punta-a-punta" component={Portada057} width={ANCHO} height={ALTO} />
        <Composition id="h058-agua-del-mate" component={AguaMate3D} durationInFrames={DUR_058} fps={FPS_058} width={ANCHO} height={ALTO} />
        <Still id="p058-agua-del-mate" component={Portada058} width={ANCHO} height={ALTO} />
        <Composition id="h059-pibe-chango-guri" component={PibeChangoGuri3D} durationInFrames={DUR_059} fps={FPS_059} width={ANCHO} height={ALTO} />
        <Still id="p059-pibe-chango-guri" component={Portada059} width={ANCHO} height={ALTO} />
        <Composition id="h060-celular-carga-noche" component={CargaNoche3D} durationInFrames={DUR_060} fps={FPS_060} width={ANCHO} height={ALTO} />
        <Still id="p060-celular-carga-noche" component={Portada060} width={ANCHO} height={ALTO} />
        <Composition id="h061-heladera-termometro" component={HeladeraTermometro3D} durationInFrames={DUR_061} fps={FPS_061} width={ANCHO} height={ALTO} />
        <Still id="p061-heladera-termometro" component={Portada061} width={ANCHO} height={ALTO} />
        <Composition id="h062-pote-microondas" component={PoteMicroondas3D} durationInFrames={DUR_062} fps={FPS_062} width={ANCHO} height={ALTO} />
        <Still id="p062-pote-microondas" component={Portada062} width={ANCHO} height={ALTO} />
        <Composition id="h063-che-origen" component={CheOrigen3D} durationInFrames={DUR_063} fps={FPS_063} width={ANCHO} height={ALTO} />
        <Still id="p063-che-origen" component={Portada063} width={ANCHO} height={ALTO} />
        <Composition id="h065-voseo-vos-o-tu" component={VoseoVosOTu3D} durationInFrames={DUR_065} fps={FPS_065} width={ANCHO} height={ALTO} />
        <Still id="p065-voseo-vos-o-tu" component={Portada065} width={ANCHO} height={ALTO} />
        <Composition id="h066-billetes-animales" component={BilletesAnimales3D} durationInFrames={DUR_066} fps={FPS_066} width={ANCHO} height={ALTO} />
        <Still id="p066-billetes-animales" component={Portada066} width={ANCHO} height={ALTO} />
        <Composition id="h067-dulce-de-leche-origen" component={DulceDeLeche3D} durationInFrames={DUR_067} fps={FPS_067} width={ANCHO} height={ALTO} />
        <Still id="p067-dulce-de-leche-origen" component={Portada067} width={ANCHO} height={ALTO} />
        <Composition id="h068-superluna-no-tan-grande" component={Superluna3D} durationInFrames={DUR_068} fps={FPS_068} width={ANCHO} height={ALTO} />
        <Still id="p068-superluna-no-tan-grande" component={Portada068} width={ANCHO} height={ALTO} />
        <Composition id="h069-chicle-siete-anios" component={Chicle3D069} durationInFrames={DUR_069} fps={FPS_069} width={ANCHO} height={ALTO} />
        <Still id="p069-chicle-siete-anios" component={Portada069} width={ANCHO} height={ALTO} />
        <Composition id="h070-rayo-despues-lluvia" component={RayoLluvia3D070} durationInFrames={DUR_070} fps={FPS_070} width={ANCHO} height={ALTO} />
        <Still id="p070-rayo-despues-lluvia" component={Portada070} width={ANCHO} height={ALTO} />
        <Composition id="h071-peces-memoria" component={Pecera3D071} durationInFrames={DUR_071} fps={FPS_071} width={ANCHO} height={ALTO} />
        <Still id="p071-peces-memoria" component={Portada071} width={ANCHO} height={ALTO} />
        <Composition id="h072-diez-por-ciento-cerebro" component={Cerebro3D072} durationInFrames={DUR_072} fps={FPS_072} width={ANCHO} height={ALTO} />
        <Still id="p072-diez-por-ciento-cerebro" component={Portada072} width={ANCHO} height={ALTO} />
        <Composition id="h073-muralla-desde-espacio" component={Muralla3D073} durationInFrames={DUR_073} fps={FPS_073} width={ANCHO} height={ALTO} />
        <Still id="p073-muralla-desde-espacio" component={Portada073} width={ANCHO} height={ALTO} />
        <Composition id="h064-nudillos-artritis" component={NudillosArtritis3D} durationInFrames={DUR_064} fps={FPS_064} width={ANCHO} height={ALTO} />
        <Still id="p064-nudillos-artritis" component={Portada064} width={ANCHO} height={ALTO} />
        <Composition id="h074-afeitar-pelo-grueso" component={AfeitarPeloGrueso3D} durationInFrames={DUR_074} fps={FPS_074} width={ANCHO} height={ALTO} />
        <Still id="p074-afeitar-pelo-grueso" component={Portada074} width={ANCHO} height={ALTO} />
        <Composition id="h075-parabrisas-empanado" component={ParabrisasEmpanado3D} durationInFrames={DUR_075} fps={FPS_075} width={ANCHO} height={ALTO} />
        <Still id="p075-parabrisas-empanado" component={Portada075} width={ANCHO} height={ALTO} />
        <Composition id="h076-calentar-el-auto" component={CalentarElAuto3D} durationInFrames={DUR_076} fps={FPS_076} width={ANCHO} height={ALTO} />
        <Still id="p076-calentar-el-auto" component={Portada076} width={ANCHO} height={ALTO} />
        <Composition id="h077-apellidos-gonzalez" component={ApellidosGonzalez3D} durationInFrames={DUR_077} fps={FPS_077} width={ANCHO} height={ALTO} />
        <Still id="p077-apellidos-gonzalez" component={Portada077} width={ANCHO} height={ALTO} />
        <Composition id="h056-gta-trece-anios"component={GtaTreceAnios3D} durationInFrames={DUR_056} fps={FPS_056} width={ANCHO} height={ALTO} />
        <Still id="p056-gta-trece-anios" component={Portada056} width={ANCHO} height={ALTO} />
        <Composition id="h055-gta-vice-city-miami"component={GtaViceCityMiami3D} durationInFrames={DUR_055} fps={FPS_055} width={ANCHO} height={ALTO} />
        <Still id="p055-gta-vice-city-miami" component={Portada055} width={ANCHO} height={ALTO} />
        <Composition id="h038-codigo-whatsapp"component={CodigoWhatsapp3D} durationInFrames={DUR_038} fps={FPS_038} width={ANCHO} height={ALTO} />
        <Still id="p038-codigo-whatsapp" component={Portada038} width={ANCHO} height={ALTO} />
        <Composition id="h039-sol-nublado" component={SolNublado3D} durationInFrames={DUR_039} fps={FPS_039} width={ANCHO} height={ALTO} />
        <Still id="p039-sol-nublado" component={Portada039} width={ANCHO} height={ALTO} />
        <Composition id="h045-una-sola-tabla" component={UnaSolaTabla3D} durationInFrames={DUR_045} fps={FPS_045} width={ANCHO} height={ALTO} />
        <Still id="p045-una-sola-tabla" component={Portada045} width={ANCHO} height={ALTO} />
        <Composition id="h040-consumo-fantasma" component={ConsumoFantasma3D} durationInFrames={DUR_040} fps={FPS_040} width={ANCHO} height={ALTO} />
        <Still id="p040-consumo-fantasma" component={Portada040} width={ANCHO} height={ALTO} />
        <Composition id="h042-laburo-italiano" component={LaburoItaliano3D} durationInFrames={DUR_042} fps={FPS_042} width={ANCHO} height={ALTO} />
        <Still id="p042-laburo-italiano" component={Portada042} width={ANCHO} height={ALTO} />
        <Composition id="h043-feriados-visita" component={FeriadosVisita3D} durationInFrames={DUR_043} fps={FPS_043} width={ANCHO} height={ALTO} />
        <Still id="p043-feriados-visita" component={Portada043} width={ANCHO} height={ALTO} />
        <Composition id="h044-misa-fabrica-aviones" component={MisaFabricaAviones3D} durationInFrames={DUR_044} fps={FPS_044} width={ANCHO} height={ALTO} />
        <Still id="p044-misa-fabrica-aviones" component={Portada044} width={ANCHO} height={ALTO} />
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
        <Composition id="hen-033-turkey-thaw" component={TurkeyThawEn033} durationInFrames={DUR_EN033} fps={FPS_EN033} width={ANCHO} height={ALTO} />
        <Still id="pen-033-turkey-thaw" component={PortadaEn033} width={ANCHO} height={ALTO} />
        <Composition id="hen-034-alcohol-cook-off" component={AlcoholEn034} durationInFrames={DUR_EN034} fps={FPS_EN034} width={ANCHO} height={ALTO} />
        <Still id="pen-034-alcohol-cook-off" component={PortadaEn034} width={ANCHO} height={ALTO} />
        <Composition id="hen-035-turkey-stuffing" component={StuffingEn035} durationInFrames={DUR_EN035} fps={FPS_EN035} width={ANCHO} height={ALTO} />
        <Still id="pen-035-turkey-stuffing" component={PortadaEn035} width={ANCHO} height={ALTO} />
        <Composition id="hen-036-phantom-charger" component={PhantomEn036} durationInFrames={DUR_EN036} fps={FPS_EN036} width={ANCHO} height={ALTO} />
        <Still id="pen-036-phantom-charger" component={PortadaEn036} width={ANCHO} height={ALTO} />
        <Composition id="hen-037-swallowed-gum" component={GumEn037} durationInFrames={DUR_EN037} fps={FPS_EN037} width={ANCHO} height={ALTO} />
        <Still id="pen-037-swallowed-gum" component={PortadaEn037} width={ANCHO} height={ALTO} />
        <Composition id="hen-041-pasta-oil" component={PastaOilEn041} durationInFrames={DUR_EN041} fps={FPS_EN041} width={ANCHO} height={ALTO} />
        <Still id="pen-041-pasta-oil" component={PortadaEn041} width={ANCHO} height={ALTO} />
        <Composition id="hen-042-frozen-pipes" component={FrozenPipesEn042} durationInFrames={DUR_EN042} fps={FPS_EN042} width={ANCHO} height={ALTO} />
        <Still id="pen-042-frozen-pipes" component={PortadaEn042} width={ANCHO} height={ALTO} />
        <Composition id="hen-043-coffee-math" component={CoffeeMathEn043} durationInFrames={DUR_EN043} fps={FPS_EN043} width={ANCHO} height={ALTO} />
        <Still id="pen-043-coffee-math" component={PortadaEn043} width={ANCHO} height={ALTO} />
        <Composition id="hen-050-stacked-discounts" component={StackedDiscountsEn050} durationInFrames={DUR_EN050} fps={FPS_EN050} width={ANCHO} height={ALTO} />
        <Still id="pen-050-stacked-discounts" component={PortadaEn050} width={ANCHO} height={ALTO} />
        <Composition id="hen-051-reheated-rice" component={ReheatedRiceEn051} durationInFrames={DUR_EN051} fps={FPS_EN051} width={ANCHO} height={ALTO} />
        <Still id="pen-051-reheated-rice" component={PortadaEn051} width={ANCHO} height={ALTO} />
        <Composition id="hen-044-wet-hair" component={WetHairEn044} durationInFrames={DUR_EN044} fps={FPS_EN044} width={ANCHO} height={ALTO} />
        <Still id="pen-044-wet-hair" component={PortadaEn044} width={ANCHO} height={ALTO} />
        <Composition id="hen-045-car-warmup" component={CarWarmupEn045} durationInFrames={DUR_EN045} fps={FPS_EN045} width={ANCHO} height={ALTO} />
        <Still id="pen-045-car-warmup" component={PortadaEn045} width={ANCHO} height={ALTO} />
        <Composition id="hen-046-wind-chill" component={WindChillEn046} durationInFrames={DUR_EN046} fps={FPS_EN046} width={ANCHO} height={ALTO} />
        <Still id="pen-046-wind-chill" component={PortadaEn046} width={ANCHO} height={ALTO} />
        <Composition id="hen-047-dog-people-food" component={DogPeopleFoodEn047} durationInFrames={DUR_EN047} fps={FPS_EN047} width={ANCHO} height={ALTO} />
        <Still id="pen-047-dog-people-food" component={PortadaEn047} width={ANCHO} height={ALTO} />
        <Composition id="hen-048-eggs-fridge" component={EggsFridgeEn048} durationInFrames={DUR_EN048} fps={FPS_EN048} width={ANCHO} height={ALTO} />
        <Still id="pen-048-eggs-fridge" component={PortadaEn048} width={ANCHO} height={ALTO} />
        <Composition id="hen-049-space-heater" component={SpaceHeaterEn049} durationInFrames={DUR_EN049} fps={FPS_EN049} width={ANCHO} height={ALTO} />
        <Still id="pen-049-space-heater" component={PortadaEn049} width={ANCHO} height={ALTO} />
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
        <Composition id="hen-038-lake-effect-snow" component={LakeEffectSnowEn038} durationInFrames={DUR_EN038} fps={FPS_EN038} width={ANCHO} height={ALTO} />
        <Still id="pen-038-lake-effect-snow" component={PortadaEn038} width={ANCHO} height={ALTO} />
        <Composition id="hen-039-polar-vortex" component={PolarVortexEn039} durationInFrames={DUR_EN039} fps={FPS_EN039} width={ANCHO} height={ALTO} />
        <Still id="pen-039-polar-vortex" component={PortadaEn039} width={ANCHO} height={ALTO} />
        <Composition id="hen-040-powerball-odds" component={PowerballOddsEn040} durationInFrames={DUR_EN040} fps={FPS_EN040} width={ANCHO} height={ALTO} />
        <Still id="pen-040-powerball-odds" component={PortadaEn040} width={ANCHO} height={ALTO} />
        <Composition id="hen-026-el-nino-winter"component={ElNinoWinterEn026} durationInFrames={DUR_EN026} fps={FPS_EN026} width={ANCHO} height={ALTO} />
        <Still id="pen-026-el-nino-winter" component={PortadaEn026} width={ANCHO} height={ALTO} />
        <Composition id="hen-027-bleach-vinegar" component={BleachVinegarEn027} durationInFrames={DUR_EN027} fps={FPS_EN027} width={ANCHO} height={ALTO} />
        <Still id="pen-027-bleach-vinegar" component={PortadaEn027} width={ANCHO} height={ALTO} />
        <Composition id="hen-028-turkey-sleepy" component={TurkeySleepyEn028} durationInFrames={DUR_EN028} fps={FPS_EN028} width={ANCHO} height={ALTO} />
        <Still id="pen-028-turkey-sleepy" component={PortadaEn028} width={ANCHO} height={ALTO} />
        <Composition id="hen-029-swim-after-eating" component={SwimAfterEatingEn029} durationInFrames={DUR_EN029} fps={FPS_EN029} width={ANCHO} height={ALTO} />
        <Still id="pen-029-swim-after-eating" component={PortadaEn029} width={ANCHO} height={ALTO} />
        <Composition id="hen-030-violent-games" component={ViolentGamesEn030} durationInFrames={DUR_EN030} fps={FPS_EN030} width={ANCHO} height={ALTO} />
        <Still id="pen-030-violent-games" component={PortadaEn030} width={ANCHO} height={ALTO} />
        <Composition id="hen-031-gta-vice-city" component={GtaViceCityEn031} durationInFrames={DUR_EN031} fps={FPS_EN031} width={ANCHO} height={ALTO} />
        <Still id="pen-031-gta-vice-city" component={PortadaEn031} width={ANCHO} height={ALTO} />
        <Composition id="hen-032-gta-13-years" component={GtaThirteenEn032} durationInFrames={DUR_EN032} fps={FPS_EN032} width={ANCHO} height={ALTO} />
        <Still id="pen-032-gta-13-years" component={PortadaEn032} width={ANCHO} height={ALTO} />
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
