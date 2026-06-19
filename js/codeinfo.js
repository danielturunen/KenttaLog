// Tehtäväkohtainen tietosisältö (KenttäLog).
//
// Tämä on itse laadittua, tiivistettyä yleistä ensihoidon tietoa OMIN SANOIN.
// Se EI ole kopioitu mistään yksittäisestä teoksesta (ei esim. Ensihoito-oppaasta),
// vaan perustuu yleisesti opetettuun, julkisesti saatavilla olevaan konsensustietoon.
// Lähteinä on käytetty avoimia viitteitä, mm.:
//   - StatPearls / NCBI Bookshelf (avoin, CC BY)
//   - European Resuscitation Council (ERC) -ohjeiden julkiset tiivistelmät
//   - AHA/ASA (sydän- ja aivoverenkierto) julkiset suositukset
//   - WHO:n avoin materiaali
// EI sisällä lääkeannoksia määräävinä – noudata aina alueellista hoito-ohjetta.

export const CODE_INFO = {
  // ---------- Peruselintoiminnan häiriö ----------
  "700": {
    what: "Eloton potilas: ei reagoi eikä hengitä normaalisti. Aika on kriittinen.",
    assess: ["Reagoimattomuus ja normaalin hengityksen puuttuminen", "Tunnista agonaalinen (haukkova) hengitys elottomuudeksi", "Rytmi monitorista: iskettävä (VF/VT) vai ei-iskettävä (PEA/asystolia)"],
    actions: ["Aloita laadukas painelu heti, minimoi tauot (≥100–120/min, syvyys riittävä)", "Defibrilloi iskettävä rytmi viiveettä", "Ilmatie ja hapetus, ventilointi", "Mieti ja hoida palautuvat syyt (hypoksia, hypovolemia, jännitysilmarinta, tamponaatio, myrkytys, elektrolyytit, lämpö)"],
    red: ["Iskettävä rytmi → defibrillointi ilman viivettä", "Epäselvä tilanne → elvytä, älä viivyttele"],
  },
  "701": {
    what: "Elvytystilanne tai elvytyksen tarpeen arviointi.",
    assess: ["Rytmin tunnistus ja toistuva tarkistus", "Painelun laatu ja keskeytysten minimointi", "ROSC-merkit (pulssi, EtCO₂-nousu, potilaan herääminen)"],
    actions: ["Painelu–defibrillointi–ilmatie–syyn hoito rytmityksen mukaan", "Kirjaa ajat tapahtumalokiin (rytmintarkistus, defib, lääke, ROSC)", "ROSC: hapetus ja verenkierron tukeminen, kuljetus hoitopaikkaan"],
    red: ["ROSC: vältä yli- ja alihapetusta, seuraa rytmiä ja painetta"],
  },
  "702": {
    what: "Tajuttomuus tai alentunut tajunta ilman selvää syytä.",
    assess: ["GCS, pupillat ja puolierot", "Verensokeri (aina!)", "Hengitys ja happeutuminen, aspiraatioriski", "Vihjeet syystä: lääkkeet, päihteet, trauma, infektio"],
    actions: ["Turvaa ilmatie (asento, apuvälineet)", "Hapetus / ventilaation tuki tarvittaessa", "Korjaa matala verensokeri hoito-ohjeen mukaan", "Etsi ja hoida syytä (mm. opioidi → naloksoni hoito-ohjeen mukaan)"],
    red: ["Matala GCS + suojaamaton ilmatie", "Epätasaiset pupillat / neurologinen puutos → AVH-epäily"],
  },
  "703": {
    what: "Hengitysvaikeus eri syistä (mm. astma, COPD, keuhkopöhö, infektio).",
    assess: ["Hengitystaajuus, SpO₂, hengitystyö ja apulihakset", "Hengitysäänet (vinkuna, rahina, hiljaisuus)", "Puhekyky kokonaisin lausein"],
    actions: ["Asentohoito (puoli-istuva), rauhoittaminen", "Lisähappi tavoitesaturaatioon", "Harkitse CPAP/NIV keuhkopöhössä hoito-ohjeen mukaan", "Syynmukainen lääkitys (esim. astma/COPD) hoito-ohjeen mukaan"],
    red: ["Uupuminen, hiljenevät hengitysäänet, laskeva SpO₂ → uhkaava hengityksen pysähdys"],
  },
  "704": {
    what: "Rintakipu, jonka taustalla voi olla sydänperäinen syy (ACS).",
    assess: ["12-kanavainen EKG mahdollisimman varhain ja toistaen", "Kivun luonne, alku, säteily, liitännäisoireet (OPQRST)", "Riskitekijät ja aiemmat sydäntapahtumat"],
    actions: ["Jatkuva rytmiseuranta, defibrillaatiovalmius", "Hoida hoito-ohjeen mukaisesti (mm. ASA/nitro paikallisen ohjeen mukaan)", "STEMI-epäily: ennakkoilmoitus ja kuljetus PCI-valmiuteen"],
    red: ["ST-nousut EKG:ssa", "Matala paine, rytmihäiriö, kylmänhikisyys → suuririskinen"],
  },
  "705": {
    what: "Rytmihäiriö: liian nopea, hidas tai epäsäännöllinen syke oireineen.",
    assess: ["12-kanavainen EKG ja jatkuva monitorointi", "Vakaus vs. epävakaus (paine, tajunta, rintakipu, hengenahdistus)", "Syke ja sen säännöllisyys"],
    actions: ["Epävakaa takykardia → kardioversiovalmius", "Oireinen bradykardia → tahdistus-/lääkevalmius hoito-ohjeen mukaan", "Dokumentoi rytmi ennen ja jälkeen hoidon"],
    red: ["Epävakauden merkit → välitön hoito", "Leveäkompleksinen takykardia → suhtaudu kammioperäisenä"],
  },
  "706": {
    what: "Aivoverenkiertohäiriön (AVH) epäily – aika on aivoja.",
    assess: ["Oirekuva (esim. FAST: kasvot, raaja, puhe)", "Oireiden tarkka alkamisaika / last known well", "Verensokeri (sulje pois matala sokeri)"],
    actions: ["Minimoi kohdeaika, vältä turhia toimenpiteitä", "Ennakkoilmoitus AVH-yksikköön (ikä, oireet, alkuaika, paine, sokeri)", "Asento ja happeutuminen, seuraa tajuntaa"],
    red: ["Tuore halvausoire + tunnettu alkuaika → liuotus-/trombektomia-ikkuna", "Tajunnan lasku → ilmatien turvaaminen"],
  },
  "707": {
    what: "Ensihoitopalveluun kuuluva hoitolaitossiirto.",
    assess: ["Siirron syy ja potilaan vakaus", "Tarvittava monitorointi ja välineet matkalle", "Meneillään olevat infuusiot/hoidot"],
    actions: ["Varmista riittävä valvonta koko siirron ajan", "Selkeä raportti ja dokumentaatio luovutuksessa (ISBAR)"],
    red: ["Vakauden heikkeneminen matkalla → uudelleenarvio ja konsultaatio"],
  },
  // ---------- Hapenpuute ----------
  "711": {
    what: "Ilmatie-este (vierasesine, turvotus, eritteet).",
    assess: ["Ilmatien avoimuus ja ääni (stridor, ei ääntä)", "Happeutuminen ja hengitystyö"],
    actions: ["Poista este hallitusti (yskytys, lyönnit/Heimlich tarpeen mukaan)", "Hapetus, varaudu ventilaatioon ja kajoavaan ilmatiehen"],
    red: ["Täydellinen tukos / tajunnan menetys → välittömät elvytystoimet"],
  },
  "713": {
    what: "Hirttäytyminen tai kuristuminen.",
    assess: ["Ilmatie ja hengitys, kaularangan vamman mahdollisuus", "Tajunta ja neurologinen tila"],
    actions: ["Turvaa ilmatie ja hapetus", "Suojaa kaularanka, seuraa tilaa", "Varaudu elvytykseen"],
    red: ["Kaulan turvotus / äänen muutos → uhkaava ilmatie"],
  },
  "714": {
    what: "Hukkuminen / hukuksiin joutuminen.",
    assess: ["Hengitys ja happeutuminen", "Ruumiinlämpö (hypotermia)", "Tapahtumatiedot (aika vedessä)"],
    actions: ["Hapetus ja ventilaatio etusijalla, varaudu elvytykseen", "Estä jäähtyminen, riisu märät vaatteet", "Kuljeta seurantaan myös vähäoireinen"],
    red: ["Hypotermia + eloton → elvytä, lämmitä ('ei kuollut ennen kuin lämmin ja kuollut')"],
  },
  // ---------- Vamma ----------
  "741": { what: "Putoaminen – epäile monivammaa korkeudesta riippuen.", assess: ["Vammamekanismi ja putoamiskorkeus", "cABCDE, rangan ja lantion arvio", "Tajunta ja raajojen liike/tunto"], actions: ["Hallitse henkeä uhkaava vuoto ensin", "Tue ranka ja immobilisoi tarpeen mukaan", "Estä jäähtyminen, kuljetus traumayksikköön"], red: ["Korkea energia, lantio-/reisivamma, neurologinen puutos"] },
  "744": { what: "Haava ja siihen liittyvä verenvuoto.", assess: ["Vuodon määrä ja sijainti, valtimovuodon merkit", "Mahdolliset liitännäisvammat"], actions: ["Suora paine → painepakkaus → kiristysside raajaan tarvittaessa", "Hemostaattinen sidos taivealueille"], red: ["Sykkivä/runsas vuoto, sokin merkit"] },
  "745": { what: "Kaatuminen (matala energia, usein iäkkäät).", assess: ["Kaatumisen syy (mekaaninen vai sairauskohtaus)", "Vammat: lonkka, ranne, pää (antikoagulantit!)"], actions: ["Tutki vammat ja syy, kivunhoito hoito-ohjeen mukaan", "Arvioi kuljetus ja kotipärjääminen"], red: ["Pään vamma + verenohennuslääkitys", "Taustalla pyörtyminen/rytmihäiriö"] },
  "746": { what: "Isku / törmäys kehoon.", assess: ["Iskun kohta, energia ja oireet", "Sisäelinvamman mahdollisuus"], actions: ["cABCDE, seuraa hemodynamiikkaa", "Kivunhoito ja immobilisaatio tarpeen mukaan"], red: ["Vatsan/rinnan tylpän vamman jälkeinen huononeminen"] },
  "747": { what: "Puristuminen tai muu mekaaninen vamma.", assess: ["Puristuksen kesto ja laajuus", "Raajojen verenkierto ja vamma-alue"], actions: ["cABCDE, vuodon hallinta", "Varaudu pitkän puristuksen jälkeisiin ongelmiin, konsultoi"], red: ["Pitkä puristusaika → metaboliset riskit vapautuksen jälkeen"] },
  // ---------- Onnettomuus (ei mekaaninen) ----------
  "751": { what: "Kaasumyrkytys (esim. häkä, savukaasut).", assess: ["Oma turvallisuus ja altisteen tunnistus", "Oireet: päänsärky, sekavuus, tajunta", "Huomaa: SpO₂ voi olla virheellisen korkea häkämyrkytyksessä"], actions: ["Poista altistuksesta turvallisesti", "Anna 100 % happea", "Kuljetus, harkitse ylipainehappihoidon tarve konsultoiden"], red: ["Tajunnan lasku, rintakipu, raskaana oleva → korkea riski"] },
  "752": { what: "Myrkytys (lääkkeet, päihteet, kemikaalit).", assess: ["Aine, määrä, antoreitti ja aika", "Peruselintoiminnot ja tajunta", "Verensokeri ja EKG tarpeen mukaan"], actions: ["Tukihoito (ABCDE) etusijalla", "Vasta-aineet vain hoito-ohjeen mukaan (esim. opioidi → naloksoni)", "Ota lääkepakkaukset mukaan, konsultoi (Myrkytystietokeskus)"], red: ["Rytmihäiriöt, kouristelu, syvä tajuttomuus"] },
  "753": { what: "Sähköisku.", assess: ["Jännite (pien-/suurjännite), virran reitti", "EKG ja rytmi, sisäänmeno-/ulostulovammat"], actions: ["Varmista virrattomuus ennen koskemista", "Monitorointi ja rytmiseuranta", "Hoida palovammat ja muut vammat"], red: ["Rytmihäiriö, tajuttomuus, suurjännite → korkea riski"] },
  "754": { what: "Palovamma (kuumuus, kemikaali, sähkö).", assess: ["Palovamman laajuus ja syvyys", "Hengitystiepalovamman merkit (noki, käheys, kasvojen palovamma)"], actions: ["Jäähdytä haalealla vedellä, suojaa, estä jäähtyminen", "Hapetus, varaudu ilmatieturvotukseen", "Kivunhoito hoito-ohjeen mukaan"], red: ["Hengitystiepalovamma, laaja palovamma, suljettu tila"] },
  "755": { what: "Ylilämpöisyys (lämpöuupumus / lämpöhalvaus).", assess: ["Ruumiinlämpö, tajunta ja iho", "Nestehukan merkit"], actions: ["Siirrä viileään, viilennä aktiivisesti", "Nesteytys hoito-ohjeen mukaan"], red: ["Tajunnan häiriö + korkea lämpö → lämpöhalvaus, hätätilanne"] },
  "756": { what: "Paleltuminen / alilämpöisyys (hypotermia).", assess: ["Ydinlämpö, tajunta ja rytmi", "Paleltumavammat raajoissa"], actions: ["Käsittele varovasti (rytmihäiriöriski), estä lisäjäähtyminen", "Lämmitä hoito-ohjeen mukaan, poista märät vaatteet"], red: ["Vaikea hypotermia → varovainen käsittely, pitkä elvytys mahdollinen"] },
  // ---------- Verenvuoto (ilman vammaa) ----------
  "761": { what: "Verenvuoto suusta (mm. ruoansulatuskanava, hengitystiet).", assess: ["Vuodon määrä ja väri (tuore/maamainen)", "Hemodynamiikka ja sokin merkit"], actions: ["Ilmatien turvaaminen, asentohoito", "Varaudu sokin hoitoon, nopea kuljetus runsaassa vuodossa"], red: ["Runsas tuore veri + matala paine → henkeä uhkaava"] },
  "762": { what: "Gynekologinen tai urologinen verenvuoto.", assess: ["Vuodon määrä, raskauden mahdollisuus", "Hemodynamiikka"], actions: ["Tukihoito ja seuranta, varaudu sokkiin", "Raskaus + vuoto → kiireellinen arvio"], red: ["Raskaus + vuoto/kipu (ektooppinen, istukkaongelma)"] },
  "763": { what: "Verenvuoto korvasta tai nenästä.", assess: ["Vuodon syy ja määrä, verenpaine", "Trauma vai spontaani"], actions: ["Nenäverenvuoto: etukumara asento ja nenäsiipien painanta", "Korvavuoto trauman jälkeen → epäile kallonpohjan vammaa"], red: ["Pään vamman jälkeinen korva-/nenävuoto"] },
  "764": { what: "Muu verenvuoto (esim. raaja).", assess: ["Vuodon lähde ja määrä", "Verenkierron riittävyys"], actions: ["Suora paine, painepakkaus, kiristysside tarvittaessa"], red: ["Hallitsematon vuoto, sokin merkit"] },
  // ---------- Sairaus (löydös) ----------
  "770": { what: "Epäselvä sairauskohtaus.", assess: ["Systemaattinen ABCDE ja peruselintoiminnot", "Esitiedot (SAMPLE), verensokeri, EKG tarpeen mukaan"], actions: ["Hoida löydösten mukaan, seuraa muutoksia", "Matala kynnys konsultaatioon"], red: ["Peruselintoimintojen poikkeavuus"] },
  "771": { what: "Sokeritasapainon häiriö (matala/korkea verensokeri).", assess: ["Verensokeri, tajunta ja nielemiskyky", "Lääkitys ja ruokailu"], actions: ["Matala sokeri: sokeria suun kautta tai hoito-ohjeen mukaan i.v./i.m.", "Korkea sokeri + huono vointi: nesteytys ja kuljetus hoito-ohjeen mukaan"], red: ["Tajuttomuus, ketoasidoosin merkit (Kussmaul-hengitys, asetonin haju)"] },
  "772": { what: "Kouristelu (epileptinen tai muu).", assess: ["Kohtauksen kesto ja toistuvuus", "Verensokeri, lämpö, vammat", "Raskaus (eklampsia mahdollinen)"], actions: ["Suojaa potilas, turvaa ilmatie kohtauksen jälkeen", "Pitkittynyt kohtaus (status) → lääkitys hoito-ohjeen mukaan viiveettä"], red: ["Kohtaus > 5 min tai toistuva ilman toipumista = status epilepticus"] },
  "773": { what: "Yliherkkyysreaktio / anafylaksia.", assess: ["A/B/C-ongelma (hengitys, verenkierto) ± iho-/limakalvo-oireet", "Altiste ja oireiden nopeus"], actions: ["Anafylaksia: i.m. adrenaliini reisilihakseen viiveettä hoito-ohjeen mukaan, toista tarvittaessa", "Poista altiste, asento (hengitys istuen, verenkierto makuulla), happi", "Tukihoito: nesteytys ja muut lääkkeet hoito-ohjeen mukaan"], red: ["Hengitysteiden turvotus, vinkuna, matala paine → välitön adrenaliini"] },
  "774": { what: "Muu sairastuminen.", assess: ["Oireet ja peruselintoiminnot", "Esitiedot ja lääkitys"], actions: ["Oireenmukainen hoito ja seuranta", "Arvioi kuljetus ja hoitolinja"], red: ["Peruselintoimintojen häiriö, nopea huononeminen"] },
  "775": { what: "Oksentelu / ripuli / virtsavaiva.", assess: ["Nestehukan merkit, kesto ja toistuvuus", "Kuume, vatsalöydökset"], actions: ["Nesteytys hoito-ohjeen mukaan, oireenmukainen hoito", "Arvioi kuljetus erityisesti iäkkäillä/lapsilla"], red: ["Vaikea kuivuma, verinen uloste/oksennus, kova vatsakipu"] },
  // ---------- Sairaus (oire) ----------
  "781": { what: "Vatsakipu.", assess: ["Kivun luonne ja sijainti (OPQRST)", "Hemodynamiikka, vatsan tutkimus", "Raskauden mahdollisuus"], actions: ["Kivunhoito hoito-ohjeen mukaan", "Tunnista kiireellistä leikkausta vaativat tilat"], red: ["Kova äkillinen kipu + matala paine (vuotava aortta, ektooppinen)", "Vatsan lautamaisuus"] },
  "782": { what: "Pää- tai niskakipu.", assess: ["Alku (äkillinen 'ukkospäänsärky'?), liitännäisoireet", "Neurologinen status, niskajäykkyys, kuume"], actions: ["Oireenmukainen hoito", "Vakavan syyn epäily → kiireellinen kuljetus"], red: ["Äkillinen kovin päänsärky, neurologinen puutos, kuume + niskajäykkyys"] },
  "783": { what: "Selkä- tai lonkkakipu.", assess: ["Kivun alku ja mekanismi", "Neurologiset oireet (alaraajat, virtsaus)"], actions: ["Kivunhoito ja asentohoito", "Arvioi liikuntakyky ja kuljetus"], red: ["Ratsupaikka-tunnottomuus, rakon toiminnan häiriö → cauda equina"] },
  "784": { what: "Raajakipu.", assess: ["Verenkierto, tunto ja liike (iskemia?)", "Turvotus, lämpö, trauma"], actions: ["Tue raaja, kivunhoito", "Akuutti iskemia/laaja turvotus → kiireellinen arvio"], red: ["Kylmä, kalpea, pulssiton raaja → valtimotukos"] },
  "785": { what: "Mielenterveysongelma / psyykkinen kriisi.", assess: ["Itsetuhoisuus ja väkivaltariski", "Sulje pois somaattiset syyt (sokeri, happi, myrkytys)"], actions: ["Oma turvallisuus, rauhallinen kohtaaminen", "Yhteistyö poliisin kanssa tarvittaessa", "Hoitopaikan ja -linjan valinta"], red: ["Konkreettinen itsetuho-/väkivaltasuunnitelma", "Sekavuus voi olla somaattinen → tutki"] },
  "786": { what: "Vartalokipu (rinta-/kylki-/yleinen).", assess: ["Sydän- ja keuhkoperäisten syiden arvio (EKG, hengitys)", "Kivun luonne (OPQRST)"], actions: ["Oireenmukainen hoito, monitorointi", "Vakavien syiden poissulku"], red: ["Rintakipu + hengenahdistus + poikkeava EKG/SpO₂"] },
  // ---------- Sairaankuljetustehtävä ----------
  "790": { what: "Hälytys puhelun aikana – tarkentuva tehtävä.", assess: ["Päivittyvät esitiedot ja kohteen tilanne"], actions: ["Valmistaudu monenlaiseen tehtävään, varmista turvallisuus"], red: ["Tieto vaarallisesta kohteesta → odota poliisia"] },
  "791": { what: "Synnytys / synnytyksen käynnistyminen.", assess: ["Synnytyksen vaihe, supistusten tiheys, ehtiikö sairaalaan", "Lapsiveden meno, vuoto, raskausviikot"], actions: ["Valmistaudu synnytykseen ja vastasyntyneen hoitoon", "Vastasyntynyt: lämpö, kuivaus, hengityksen tukeminen tarvittaessa", "Äidin seuranta, varaudu vuotoon"], red: ["Poikkeava tarjonta, napanuora, runsas vuoto, kouristelu (eklampsia)"] },
  "792": { what: "Varallaolo / valmiussiirto.", assess: ["Tehtävän luonne ja valmiusvaatimus"], actions: ["Pidä valmius ja välineet kunnossa"], red: [] },
  "793": { what: "Hoitolaitossiirto.", assess: ["Potilaan vakaus ja siirron syy", "Meneillään olevat hoidot ja monitorointi"], actions: ["Riittävä valvonta matkalla, selkeä luovutus (ISBAR)"], red: ["Vointi heikkenee matkalla → konsultoi"] },
  "794": { what: "Muu sairaankuljetus- tai aikatilaustehtävä.", assess: ["Potilaan vointi ja kuljetustarve"], actions: ["Tarpeenmukainen seuranta ja kirjaus"], red: ["Odottamaton huononeminen"] },
  "796": { what: "Monipotilastilanne / suuronnettomuus.", assess: ["Tilannearvio (METHANE), potilaiden määrä ja vakavuus", "Oma turvallisuus ja työnjako"], actions: ["Triage ja priorisointi, johtaminen", "Lisäresurssit ja raportointi johdolle"], red: ["Resurssit alimitoitetut → triage ja lisäavun hälytys etusijalla"] },
};

// X-koodien yhteinen tietosisältö (ei kuljetusta).
export const X_INFO = {
  what: "Tehtävä, jossa potilasta ei kuljeteta. Huolellinen tutkiminen, päätöksen perustelu ja jatko-ohjeet korostuvat.",
  assess: ["Peruselintoiminnot ja oireet dokumentoidusti", "Potilaan kyky ymmärtää ja päättää hoidostaan", "Sosiaalinen tilanne ja kotona pärjääminen"],
  actions: ["Varmista, ettei jää henkeä uhkaavaa tilaa", "Konsultoi / pyydä hoito-ohje tarvittaessa", "Anna selkeät jatko-ohjeet ja turvaverkko (milloin soitettava uudelleen)", "Kirjaa tutkiminen, päätöksen perustelu, suostumus ja konsultaatio"],
  red: ["Epäselvä tilanne tai potilaan kieltäytyminen riskialttiisti → konsultoi ja dokumentoi tarkasti"],
};

export function codeInfo(code) {
  code = (code || "").toUpperCase();
  if (CODE_INFO[code]) return CODE_INFO[code];
  if (/^X-/.test(code)) return X_INFO;
  return null;
}
