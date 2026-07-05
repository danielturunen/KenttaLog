// Tehtäväkohtainen tietosisältö (KenttäLog).
//
// Tämä on itse laadittua, tiivistettyä yleistä ensihoidon tietoa OMIN SANOIN.
// Se EI ole kopioitu mistään yksittäisestä teoksesta (ei esim. Ensihoito-oppaasta),
// vaan perustuu yleisesti opetettuun, julkisesti saatavilla olevaan konsensustietoon.
// Lähteinä on käytetty avoimia viitteitä, mm.:
//   - Käypä hoito -suositusten julkiset versiot (kaypahoito.fi)
//   - StatPearls / NCBI Bookshelf (avoin, CC BY)
//   - European Resuscitation Council (ERC) -ohjeiden julkiset tiivistelmät
//   - AHA/ASA (sydän- ja aivoverenkierto) julkiset suositukset
//   - WHO:n avoin materiaali
// EI sisällä lääkeannoksia määräävinä – noudata aina alueellista hoito-ohjetta.
//
// Kenttien työnjako:
//   what    = mikä tehtävä on
//   ask     = haastattelu: mitä kysyn potilaalta/silminnäkijöiltä – ja MIKSI
//             (muoto "kysymys – perustelu"; sovellus lihavoi kysymysosan)
//   assess  = mitä tutkin ja mittaan
//   actions = hoidon linjat
//   red     = hälytysmerkit

export const CODE_INFO = {
  // ---------- Peruselintoiminnan häiriö ----------
  "700": {
    what: "Eloton potilas: ei reagoi eikä hengitä normaalisti. Hoitotason elvytys (ALS) alkaa heti.",
    ask: [
      "Milloin potilas lyyhistyi tai löydettiin? – tavoittamisviive ohjaa hoitoa ja ennustearviota",
      "Näkikö joku tapahtuman? – nähty elottomuus ennustaa paremmin kuin löydetty",
      "Aloitettiinko maallikkoelvytys ja milloin? – painelutauon pituus ratkaisee",
      "Neuvova defibrillaattori: suositteliko iskua ja iskettiinkö? – kertoo alkurytmin (VF/pVT vs. ei-iskettävä) ennen monitoriasi",
      "Edeltävät oireet (rintakipu, hengenahdistus) ja perussairaudet? – johtolanka palautuviin syihin (4H + 4T)",
      "Hoitolinjaus (DNR) tiedossa? – vaikuttaa elvytyspäätökseen, varmista lähteestä",
    ],
    assess: ["Reagoimattomuus ja normaalin hengityksen puuttuminen; agonaalihengitys = eloton", "Alkurytmi monitorista: iskettävä (VF/pVT) vai ei-iskettävä (PEA/asystolia) – kirjaa", "Kapnografia (EtCO₂): ventilaation ja painelun laadun mittari; äkillinen nousu → tarkista ROSC"],
    actions: ["Laadukas painelu (100–120/min, 5–6 cm), tauot alle 5 s", "Defibrilloi VF/pVT viiveettä, jatka 2 min jaksoissa rytmintarkistuksin", "Ilmatien varmistus (supraglottinen väline tai intubaatio) ja kapnografia; ventilaatio 10/min ilman hyperventilaatiota", "Suoniyhteys tai i.o. – adrenaliini ja amiodaroni hoito-ohjeen rytmityksellä", "Käy läpi palautuvat syyt 4H + 4T ja hoida löydetty syy"],
    red: ["Iskettävä rytmi → defibrillointi ilman viivettä", "EtCO₂:n äkillinen nousu → ROSC-tarkistus", "Epäselvä tilanne → elvytä, älä viivyttele"],
  },
  "701": {
    what: "Elvytystilanne tai elvytyksen tarpeen arviointi (ALS).",
    ask: [
      "Lyyhistymisaika – nähty vai löydetty? – hypoksia-ajan arvio",
      "Maallikkoelvytyksen alku ja laatu? – keskeytyksetön painelu parantaa ennustetta",
      "Perussairaudet, lääkitys ja hoitolinjaus (DNR)? – ohjaa elvytyspäätöstä ja syynetsintää",
    ],
    assess: ["Rytmin tunnistus ja tarkistus 2 min välein", "Painelun laatu ja keskeytysten minimointi (vaihda painelijaa)", "ROSC-merkit: EtCO₂-nousu, pulssi, potilaan herääminen"],
    actions: ["Rytmipohjainen protokolla: painelu–defibrillointi–ilmatie–lääkkeet hoito-ohjeen mukaan", "Kapnografia koko elvytyksen ajan: intubaation varmistus, painelun laatu, ROSC", "Palautuvat syyt 4H + 4T: Hypoksia, Hypovolemia, Hypo-/hyperkalemia (metaboliset), Hypotermia · Tensiopneumotoraksi, Tamponaatio, Tromboosi (sydän/keuhko), Toksiinit", "ROSC: tavoitteellinen hapetus (SpO₂ 94–98 %) ja normoventilaatio, verenpaineen tuki, 12-EKG, ennakkoilmoitus"],
    red: ["ROSC: vältä yli- ja alihapetusta, seuraa rytmiä ja painetta", "Hypotermisen elvytys on pitkä – ei kuollut ennen kuin lämmin ja kuollut"],
  },
  "702": {
    what: "Tajuttomuus tai alentunut tajunta ilman selvää syytä.",
    ask: [
      "Miten tajunta meni: äkillisesti vai vähitellen? – äkillinen viittaa sydän- tai aivoperäiseen syyhyn",
      "Edeltävät oireet: rintakipu, päänsärky, kouristelu, kuume? – suuntaa syynetsintää",
      "Diabetes ja insuliini? Milloin söi viimeksi? – hypoglykemia on nopeasti korjattava syy",
      "Lääkkeitä, alkoholia tai huumeita saatavilla/käytetty? – myrkytysepäily; päihtymys ei silti selitä tajuttomuutta yksin",
      "Kaatuiko tai löikö päänsä? – aivovamman mahdollisuus",
      "Silminnäkijältä: kouristiko, virtsankarkailu, kesto? – erottaa kohtauksen ja pyörtymisen",
    ],
    assess: ["GCS osapisteineen (E/V/M), pupillat ja puolierot", "Verensokeri (aina!)", "Syyt järjestelmällisesti – VOI IHME!: Vuoto kallon sisällä · O₂-puute (hypoksia) · Intoksikaatio · Infektio (meningiitti, sepsis) · Hypoglykemia · Matala verenpaine (sokki) · Epilepsia (kohtaus tai jälkitila) · ! = psykogeeninen (poissulkudiagnoosi)", "Rinnakkaismuistisääntö MIDAS: Meningiitti · Intoksikaatio · Diabetes · Anoksia · Subduraalihematooma", "Hengitys ja happeutuminen, aspiraatioriski"],
    actions: ["Turvaa ilmatie (asento, nieluputki/supraglottinen tarvittaessa); varaudu ilmatien varmistukseen jos GCS ≤ 8", "Hapetus / ventilaation tuki, EtCO₂ tarvittaessa", "Korjaa matala verensokeri hoito-ohjeen mukaan", "Etsi ja hoida syy VOI IHME! -listalla (mm. opioidi → naloksoni hoito-ohjeen mukaan)", "12-EKG ja lämpö osana syynetsintää"],
    red: ["GCS ≤ 8 + suojaamaton ilmatie → ilmatien varmistus", "Epätasaiset pupillit / puoliero → kallonsisäinen syy, kiireellinen kuvantaminen"],
  },
  "703": {
    what: "Hengitysvaikeus eri syistä (mm. astma, COPD, keuhkopöhö, infektio).",
    ask: [
      "Milloin alkoi: äkillisesti vai päivien kuluessa? – äkillinen viittaa emboliaan/ilmarintaan, hidas pahenemisvaiheeseen",
      "Perussairaus: astma, COPD, sydämen vajaatoiminta? – vertaa potilaan omaan normaalitilaan",
      "Onko avaavan lääkkeen tarve lisääntynyt? Hoitava lääke käytössä? – astman pahenemisvaiheen tunnusmerkki",
      "Yskösten määrä tai märkäisyys muuttunut? – COPD:n pahenemisvaihe",
      "Helpottaako istuma-asento? Yöllinen hengenahdistus, painonnousu, turvotukset? – viittaa vajaatoimintaan",
      "Aiemmat sairaala- tai tehohoidot hengitysvaikeuden vuoksi? – tunnistaa riskipotilaan",
    ],
    assess: ["Hengitystaajuus, SpO₂, hengitystyö ja apulihakset", "Hengitysäänet auskultoiden (vinkuna, rahina, hiljaisuus – 'hiljainen rintakehä' on hälytysmerkki)", "Puhekyky kokonaisin lausein; EtCO₂ tarvittaessa", "Vaikeusarvio: taajuus, syke, tajunta, uupumus"],
    actions: ["Asentohoito (puoli-istuva), rauhoittaminen", "Lisähappi tavoitesaturaatioon (COPD: hallitusti, tavoite 88–92 %)", "CPAP keuhkopöhössä, NIV-valmius hoito-ohjeen mukaan", "Syynmukainen lääkitys (inhaloitavat, i.v.-lääkkeet) hoito-ohjeen mukaan", "12-EKG jos sydänperäinen syy mahdollinen"],
    red: ["Uupuminen, hiljenevät hengitysäänet, laskeva SpO₂ → uhkaava hengityksen pysähdys", "COPD + uneliaisuus → hiilidioksidiretentio"],
  },
  "704": {
    what: "Rintakipu, jonka taustalla voi olla sydänperäinen syy (ACS).",
    ask: [
      "OPQRST-runko kipuanamneesiin – O = Onset (alku: milloin, mitä tehdessä, äkillinen vai vähittäinen) · P = Provocation/Palliation (mikä pahentaa tai helpottaa: rasitus, asento, hengitys, nitro) · Q = Quality (luonne: puristava, painava, terävä, repivä) · R = Radiation (säteily: käsi, kaula, leuka, selkä) · S = Severity (voimakkuus NRS 0–10) · T = Time (kesto ja muutos ajassa)",
      "Puristava, painava, laaja-alainen retrosternaalinen kipu? – tyypillinen ACS-kipu",
      "Alkamisaika tarkasti? – ratkaisee reperfuusiohoidon ikkunat",
      "Hikisyys, pahoinvointi, hengenahdistus? – autonomiset liitännäisoireet nostavat riskiä",
      "Aiempi sepelvaltimotauti, PCI/ohitus? Auttoiko nitro? – tunnettu tauti + tuttu kipu",
      "Riskitekijät: tupakointi, diabetes, verenpaine, dyslipidemia, sukurasite? – riskiarvio",
      "Repivä, heti alussa maksimaalinen kipu selkään? Puoliero paineissa? – aortan dissekaation epäily",
    ],
    assess: ["12-kanavainen EKG mahdollisimman varhain (tavoite 10 min) ja toistaen", "Kivun luonne, alku, säteily, liitännäisoireet (OPQRST)", "Muista: iäkkäillä, diabeetikoilla ja naisilla epätyypilliset oireet (väsymys, huono olo) ovat yleisiä"],
    actions: ["Jatkuva rytmiseuranta, defibrillaatiovalmius", "Hoida hoito-ohjeen mukaisesti (mm. ASA/nitro paikallisen ohjeen mukaan)", "STEMI-epäily: ennakkoilmoitus ja kuljetus PCI-valmiuteen"],
    red: ["ST-nousut EKG:ssa", "Matala paine, rytmihäiriö, kylmänhikisyys → suuririskinen"],
  },
  "705": {
    what: "Rytmihäiriö: liian nopea, hidas tai epäsäännöllinen syke oireineen.",
    ask: [
      "Milloin tuntemukset alkoivat? – eteisvärinässä alle/yli 48 h ratkaisee rytminsiirron edellytykset",
      "Verenohennuslääkitys ja otetut annokset? – vaikuttaa hoitolinjaan",
      "Aiemmat rytmihäiriöt ja miten ne on hoidettu? – tuttu kohtaus vs. uusi",
      "Rintakipu, hengenahdistus, huimaus tai pyörtyminen? – epävakauden merkit vaativat välitöntä hoitoa",
      "Kofeiini, alkoholi, stimulantit, kuume, valvominen? – tavalliset laukaisijat",
    ],
    assess: ["12-kanavainen EKG ja jatkuva monitorointi", "Epävakauden kriteerit: hypotensio, tajunnan häiriö, iskeeminen rintakipu, keuhkopöhö – yksikin riittää", "Kapea vs. leveä QRS, säännöllinen vs. epäsäännöllinen – ohjaa hoitolinjan"],
    actions: ["Epävakaa takykardia → sähköinen kardioversio hoito-ohjeen mukaan", "Vakaa SVT: vagaaliset manööverit, adenosiini hoito-ohjeen/konsultaation mukaan", "Oireinen bradykardia → lääke- ja tahdistusvalmius hoito-ohjeen mukaan", "Dokumentoi rytmi EKG:lle ennen ja jälkeen hoidon"],
    red: ["Epävakauden merkit → välitön hoito", "Leveäkompleksinen takykardia → suhtaudu kammioperäisenä"],
  },
  "706": {
    what: "Aivoverenkiertohäiriön (AVH) epäily – aika on aivoja.",
    ask: [
      "Tarkka oireiden alkamisaika tai viimeisin oireeton havainto? – liuotusikkuna 4,5 h, valikoiduilla pidempi",
      "Verenohennus (varfariini, DOAC) ja viimeisin annos? – hoitotasoinen antikoagulaatio on liuotuksen vasta-aihe",
      "Menivätkö oireet jo ohi? – TIA on yhtä kiireellinen: aivoinfarktin riski ~5 % vuorokaudessa",
      "Kouristiko alussa? Kova päänsärky? – erotusdiagnostiikka (kohtaus, SAV)",
      "Aiempi toimintakyky ja perussairaudet? – vaikuttaa hoitolinjaukseen",
    ],
    assess: ["Oirekuva (FAST: kasvot, raaja, puhe + aika)", "Verensokeri – hypoglykemia voi matkia AVH:ta", "Tajunta ja sen kehitys"],
    actions: ["Minimoi kohdeaika, vältä turhia toimenpiteitä", "Ennakkoilmoitus AVH-yksikköön (ikä, oireet, alkuaika, paine, sokeri, antikoagulaatio)", "Asento ja happeutuminen, seuraa tajuntaa"],
    red: ["Tuore halvausoire + tunnettu alkuaika → liuotus-/trombektomiaikkuna", "Tajunnan lasku → ilmatien turvaaminen"],
  },
  "707": {
    what: "Ensihoitopalveluun kuuluva hoitolaitossiirto.",
    ask: [
      "Miksi siirretään ja mikä on vointi nyt? – siirron kiireellisyys ja riskit",
      "Meneillään olevat infuusiot, lääkitykset ja hoidot? – mitä pitää jatkaa matkalla",
      "Luovuttavan yksikön raportti (ISBAR)? – tilanne, tausta, arvio, toimintaehdotus",
    ],
    assess: ["Siirron syy ja potilaan vakaus", "Tarvittava monitorointi ja välineet matkalle"],
    actions: ["Varmista riittävä valvonta koko siirron ajan", "Selkeä raportti ja dokumentaatio luovutuksessa (ISBAR)"],
    red: ["Vakauden heikkeneminen matkalla → uudelleenarvio ja konsultaatio"],
  },
  // ---------- Hapenpuute ----------
  "711": {
    what: "Ilmatie-este (vierasesine, turvotus, eritteet).",
    ask: [
      "Mitä potilas oli tekemässä (syömässä)? – vierasesineen todennäköisyys",
      "Pystyykö puhumaan tai yskimään? – erottaa osittaisen ja täydellisen esteen",
      "Kauanko tilanne on kestänyt ja mitä on jo yritetty? – hypoksia-aika ja jatkotoimet",
    ],
    assess: ["Ilmatien avoimuus ja ääni (stridor, ei ääntä)", "Happeutuminen ja hengitystyö"],
    actions: ["Poista este hallitusti (yskitys, lyönnit/Heimlich tarpeen mukaan)", "Näkyvä este: laryngoskopia ja Magillin pihdit hoitotasolla", "Hapetus, varaudu ventilaatioon ja kajoavaan ilmatiehen hoito-ohjeen mukaan"],
    red: ["Täydellinen tukos / tajunnan menetys → välittömät elvytystoimet"],
  },
  "713": {
    what: "Hirttäytyminen tai kuristuminen.",
    ask: [
      "Roikkuiko vartalo ja kuinka kauan? – kaularankavamman ja hypoksian riski",
      "Kuka löysi, missä asennossa ja milloin viimeksi nähty? – aika-arvio",
      "Ääni käheä, nielemiskipu? – kehittyvä ilmatieturvotus",
      "Itsetuhoisuus taustalla? – psykiatrinen arvio kuuluu jatkoon",
    ],
    assess: ["Ilmatie ja hengitys, kaularangan vamman mahdollisuus", "Tajunta ja neurologinen tila"],
    actions: ["Turvaa ilmatie ja hapetus", "Suojaa kaularanka, seuraa tilaa", "Varaudu elvytykseen"],
    red: ["Kaulan turvotus / äänen muutos → uhkaava ilmatie"],
  },
  "714": {
    what: "Hukkuminen / hukuksiin joutuminen.",
    ask: [
      "Kauanko veden alla tai vedessä? – hypoksia-ajan arvio",
      "Veden lämpötila? – kylmä vesi: hypotermia voi suojata, elvytä pitkään",
      "Sukellus tai hyppy matalaan? – kaularankavamman mahdollisuus",
      "Miten pelastettiin ja elvytettiinkö? – tapahtumaketju",
    ],
    assess: ["Hengitys ja happeutuminen", "Ruumiinlämpö (hypotermia)", "Tapahtumatiedot (aika vedessä)"],
    actions: ["Hapetus ja ventilaatio etusijalla, varaudu elvytykseen", "Estä jäähtyminen, riisu märät vaatteet", "Kuljeta seurantaan myös vähäoireinen"],
    red: ["Hypotermia + eloton → elvytä, lämmitä ('ei kuollut ennen kuin lämmin ja kuollut')"],
  },
  // ---------- Vamma ----------
  "741": {
    what: "Putoaminen – epäile monivammaa korkeudesta riippuen.",
    ask: [
      "Mistä korkeudesta ja mille alustalle? – energia määrää vammaepäilyn",
      "Miksi putosi: liukastui vai tuliko sairauskohtaus? – syy voi olla tärkeämpi kuin seuraus",
      "Pääsikö heti ylös? Mihin sattuu? – karkea toimintakykyarvio",
      "Verenohennuslääkitys? – sisäisen vuodon ja aivovamman riski kasvaa",
    ],
    assess: ["Vammamekanismi ja putoamiskorkeus", "cABCDE, rangan ja lantion arvio", "Rangan tuennan tarve (NEXUS-tyyppiset kriteerit): keskilinjan aristus, neurologinen puutos, alentunut tajunta, päihtymys tai kivulias muu vamma → tue", "Tajunta ja raajojen liike/tunto"],
    actions: ["Hallitse henkeä uhkaava vuoto ensin", "Tue ranka ja immobilisoi kriteerien täyttyessä", "Suoniyhteys ja kivunhoito hoito-ohjeen mukaan", "Estä jäähtyminen, kuljetus traumayksikköön"],
    red: ["Korkea energia, lantio-/reisivamma, neurologinen puutos"],
  },
  "744": {
    what: "Haava ja siihen liittyvä verenvuoto.",
    ask: [
      "Millä ja milloin haava syntyi? – likainen/syvä mekanismi ohjaa jatkohoitoa",
      "Paljonko on vuotanut ennen saapumista? – hukatun veren arvio",
      "Verenohennuslääkitys? Jäykkäkouristusrokote voimassa? – vuoto- ja infektioriski",
      "Puutuminen tai voimattomuus haavan ääreispuolella? – hermo- tai jännevaurio",
    ],
    assess: ["Vuodon määrä ja sijainti, valtimovuodon merkit", "Mahdolliset liitännäisvammat"],
    actions: ["Suora paine → painepakkaus → kiristysside raajaan tarvittaessa", "Hemostaattinen sidos taivealueille"],
    red: ["Sykkivä/runsas vuoto, sokin merkit"],
  },
  "745": {
    what: "Kaatuminen (matala energia, usein iäkkäät).",
    ask: [
      "Miksi kaatui: kompastui vai huimasi/pyörtyi ensin? – sairauskohtaus kaatumisen takana on löydettävä",
      "Löikö päänsä? Muistikatko tapahtumasta? – aivovamman merkit",
      "Verenohennuslääkitys? – pään vamma + antikoagulaatio = aina matala kynnys päivystykseen",
      "Pystyykö varaamaan jalalle? Lonkkakipu, lyhentynyt ulkokiertoinen raaja? – lonkkamurtuma",
      "Aiemmat kaatumiset ja kotona pärjääminen? – kokonaisarvio ja jatkosuunnitelma",
    ],
    assess: ["Kaatumisen syy (mekaaninen vai sairauskohtaus)", "Vammat: lonkka, ranne, pää", "Ortostatismi, rytmi, verensokeri syyn arviossa"],
    actions: ["Tutki vammat ja syy, kivunhoito hoito-ohjeen mukaan", "Arvioi kuljetus ja kotipärjääminen"],
    red: ["Pään vamma + verenohennuslääkitys", "Taustalla pyörtyminen/rytmihäiriö"],
  },
  "746": {
    what: "Isku / törmäys kehoon.",
    ask: [
      "Mihin osui ja millä voimalla/välineellä? – energia ja sisäelinvamman riski",
      "Lisääntyykö vatsan tai rinnan kipu? – kehittyvä sisäinen vuoto",
      "Verenohennus? – vuotoriski",
    ],
    assess: ["Iskun kohta, energia ja oireet", "Sisäelinvamman mahdollisuus"],
    actions: ["cABCDE, seuraa hemodynamiikkaa", "Kivunhoito ja immobilisaatio tarpeen mukaan"],
    red: ["Vatsan/rinnan tylpän vamman jälkeinen huononeminen"],
  },
  "747": {
    what: "Puristuminen tai muu mekaaninen vamma.",
    ask: [
      "Kuinka kauan puristuksissa ja mikä kehonosa? – pitkä puristus → vapautuksen jälkeiset metaboliset riskit",
      "Miten vapautui / vapautetaanko vasta nyt? – ajoita hoito vapautukseen",
    ],
    assess: ["Puristuksen kesto ja laajuus", "Raajojen verenkierto ja vamma-alue"],
    actions: ["cABCDE, vuodon hallinta", "Varaudu pitkän puristuksen jälkeisiin ongelmiin, konsultoi"],
    red: ["Pitkä puristusaika → metaboliset riskit vapautuksen jälkeen"],
  },
  // ---------- Onnettomuus (ei mekaaninen) ----------
  "751": {
    what: "Kaasumyrkytys (esim. häkä, savukaasut).",
    ask: [
      "Mikä lähde: tulipalo, kaasulämmitin, auton pakokaasu, grilli sisätilassa? – häkäepäily",
      "Kuinka kauan altistui ja missä tilassa? – annos-arvio",
      "Montako altistunutta? – kaikki saman lähteen äärellä olleet tutkittava",
      "Päänsärky, pahoinvointi, sekavuus muillakin? – häkämyrkytyksen klassinen kuva",
    ],
    assess: ["Oma turvallisuus ja altisteen tunnistus", "Oireet: päänsärky, sekavuus, tajunta", "Huomaa: SpO₂ voi näyttää virheellisen hyvää häkämyrkytyksessä"],
    actions: ["Poista altistuksesta turvallisesti", "Anna 100 % happea", "Kuljetus, harkitse ylipainehappihoidon tarve konsultoiden"],
    red: ["Tajunnan lasku, rintakipu, raskaana oleva → korkea riski"],
  },
  "752": {
    what: "Myrkytys (lääkkeet, päihteet, kemikaalit).",
    ask: [
      "Mitä otettu, kuinka paljon, milloin ja mitä reittiä? – myrkytyksen vakavuusarvio ja hoitoikkunat",
      "Sekakäyttö: alkoholi + lääkkeet + huumeet? – yhdistelmät vaarallisimpia (opioidi + bentso + alkoholi)",
      "Löytyykö pakkauksia, liuskoja, viestiä? – ota mukaan, ne ovat paras tietolähde",
      "Oliko tarkoituksellinen? – itsetuhoisuuden arvio ja psykiatrinen jatko kuuluvat hoitoon",
      "Oksentanut? Tajunnan kehitys löytämisestä? – kulku ennustaa suuntaa",
    ],
    assess: ["Peruselintoiminnot ja tajunta", "Verensokeri aina; 12-EKG: leveä QRS tai pitkä QT viittaa kardiotoksisuuteen (esim. trisykliset)", "Pistemäiset pupillit + hengityslama → opioidi", "Toksidroomin tunnistus: opioidi, stimulantti, antikolinerginen, sedatiivi"],
    actions: ["Tukihoito (ABCDE) etusijalla, ilmatiestä huolehtiminen", "Vasta-aineet vain hoito-ohjeen mukaan (esim. opioidi → naloksoni; huom. vaikutus loppuu ~30 min → seuranta)", "Konsultoi Myrkytystietokeskusta / ensihoitolääkäriä"],
    red: ["Rytmihäiriöt, kouristelu, syvä tajuttomuus", "Päihtymys ei selitä tajuttomuutta – sulje muut syyt pois"],
  },
  "753": {
    what: "Sähköisku.",
    ask: [
      "Mikä jännite: pienjännite (koti) vai suurjännite? – suurjännite = aina korkea riski",
      "Virran reitti: kädestä käteen tai rintakehän läpi? – rytmihäiriöriski",
      "Heittikö irti, kaatuiko, löikö päänsä? – liitännäisvammat",
      "Rytmituntemuksia, rintakipua tapahtuman jälkeen? – seurannan tarve",
    ],
    assess: ["Jännite ja virran reitti", "EKG ja rytmi, sisäänmeno-/ulostulovammat"],
    actions: ["Varmista virrattomuus ennen koskemista", "Monitorointi ja rytmiseuranta", "Hoida palovammat ja muut vammat"],
    red: ["Rytmihäiriö, tajuttomuus, suurjännite → korkea riski"],
  },
  "754": {
    what: "Palovamma (kuumuus, kemikaali, sähkö).",
    ask: [
      "Mikä paloi ja missä tilassa? Suljettu tila? – hengitystiepalovamman ja häkäaltistuksen riski",
      "Kuinka kauan altistui ja onko jäähdytys aloitettu? – jäähdytyksen hyöty ensimmäisinä minuutteina",
      "Räjähdys mukana? – paineaaltovammat",
    ],
    assess: ["Laajuus 9 %:n säännöllä (aikuinen: pää 9, yläraaja 9, alaraaja 18, vartalon etu/taka 18+18); potilaan kämmen sormineen ≈ 1 %", "Syvyys: pinnallinen (punoitus, kipu) vs. syvä (vaalea/hiiltynyt, tunnoton)", "Hengitystiepalovamman merkit (noki, käheys, kasvojen palovamma)"],
    actions: ["Jäähdytä haalealla vedellä (10–20 min), suojaa, estä jäähtyminen", "Hapetus; varaudu ilmatieturvotukseen ja varhaiseen ilmatien varmistukseen", "Suoniyhteys, nestehoito ja kivunhoito (usein i.v.-opioidi) hoito-ohjeen mukaan", "Laaja/syvä vamma tai hengitystie-epäily → palovammakeskuksen konsultaatio"],
    red: ["Hengitystiepalovamma, laaja palovamma, suljettu tila"],
  },
  "755": {
    what: "Ylilämpöisyys (lämpöuupumus / lämpöhalvaus).",
    ask: [
      "Olosuhteet ja altistuksen kesto? Rasitus? – lämpöhalvauksen riski",
      "Onko juonut ja mitä? – nestehukan arvio",
      "Lääkitys: diureetit, psyykenlääkkeet, antikolinergit? – heikentävät lämmönsäätelyä",
    ],
    assess: ["Ruumiinlämpö, tajunta ja iho", "Nestehukan merkit"],
    actions: ["Siirrä viileään, viilennä aktiivisesti", "Nesteytys hoito-ohjeen mukaan"],
    red: ["Tajunnan häiriö + korkea lämpö → lämpöhalvaus, hätätilanne"],
  },
  "756": {
    what: "Paleltuminen / alilämpöisyys (hypotermia).",
    ask: [
      "Kauanko kylmässä ja millaisissa olosuhteissa (märkä, tuuli)? – jäähtymisnopeus",
      "Milloin viimeksi nähty normaalivointisena? – aika-arvio",
      "Alkoholi tai lääkkeet? – yleisin taustatekijä, heikentää arviota",
    ],
    assess: ["Ydinlämpö, tajunta ja rytmi", "Paleltumavammat raajoissa"],
    actions: ["Käsittele varovasti (rytmihäiriöriski), estä lisäjäähtyminen", "Lämmitä hoito-ohjeen mukaan, poista märät vaatteet"],
    red: ["Vaikea hypotermia → varovainen käsittely, pitkä elvytys mahdollinen"],
  },
  // ---------- Verenvuoto (ilman vammaa) ----------
  "761": {
    what: "Verenvuoto suusta (mm. ruoansulatuskanava, hengitystiet).",
    ask: [
      "Tuoretta verta vai kahvinporomaista? Oksennus vai yskös? – vuodon lähde ja tuoreus",
      "Maksasairaus tai runsas alkoholinkäyttö? – laskimolaajentumavuodon riski",
      "NSAID, kortisoni tai verenohennus käytössä? – mahahaavan ja vuodon riski",
      "Musta, tervamainen uloste? – merkki ylemmästä GI-vuodosta",
    ],
    assess: ["Vuodon määrä ja väri (tuore/maamainen)", "Hemodynamiikka ja sokin merkit"],
    actions: ["Ilmatien turvaaminen, asentohoito", "Kaksi suoniyhteyttä ja nestehoito sokissa hoito-ohjeen mukaan", "Nopea kuljetus runsaassa vuodossa, ennakkoilmoitus"],
    red: ["Runsas tuore veri + matala paine → henkeä uhkaava"],
  },
  "762": {
    what: "Gynekologinen tai urologinen verenvuoto.",
    ask: [
      "Raskauden mahdollisuus? Viimeisimmät kuukautiset? – ektooppinen raskaus on suljettava pois",
      "Vuodon määrä: montako sidettä tunnissa? – konkretisoi vuodon runsauden",
      "Kipua? Missä ja millaista? – kipu + vuoto + raskaus = kiireellinen",
      "Raskausviikot, jos raskaana? – istukkaongelmat loppuraskaudessa",
    ],
    assess: ["Vuodon määrä, raskauden mahdollisuus", "Hemodynamiikka"],
    actions: ["Tukihoito ja seuranta, varaudu sokkiin", "Raskaus + vuoto → kiireellinen arvio"],
    red: ["Raskaus + vuoto/kipu (ektooppinen, istukkaongelma)"],
  },
  "763": {
    what: "Verenvuoto korvasta tai nenästä.",
    ask: [
      "Trauma vai spontaani? – trauman jälkeinen korvavuoto viittaa kallonpohjan vammaan",
      "Verenohennuslääkitys tai verenpainetauti? – pitkittyneen vuodon taustat",
      "Kauanko vuotanut ja mitä on jo kokeiltu? – jatkotoimien valinta",
    ],
    assess: ["Vuodon syy ja määrä, verenpaine", "Trauma vai spontaani"],
    actions: ["Nenäverenvuoto: etukumara asento ja nenäsiipien painanta", "Korvavuoto trauman jälkeen → epäile kallonpohjan vammaa"],
    red: ["Pään vamman jälkeinen korva-/nenävuoto"],
  },
  "764": {
    what: "Muu verenvuoto (esim. raaja).",
    ask: [
      "Mistä vuotaa ja kauanko on vuotanut? – hukatun määrän arvio",
      "Verenohennuslääkitys? – vuoto ei asetu tavalliseen tapaan",
    ],
    assess: ["Vuodon lähde ja määrä", "Verenkierron riittävyys"],
    actions: ["Suora paine, painepakkaus, kiristysside tarvittaessa"],
    red: ["Hallitsematon vuoto, sokin merkit"],
  },
  // ---------- Sairaus (löydös) ----------
  "770": {
    what: "Epäselvä sairauskohtaus.",
    ask: [
      "Mikä muuttui, milloin ja kuka huolestui? – 'mikä on toisin kuin normaalisti' on paras kysymys",
      "Esitiedot huolella (SAMPLE): oireet, allergiat, lääkitys, sairaudet, syöminen, tapahtumat",
      "Infektio-oireet: kuume, yskä, virtsavaivat? – iäkkään sekavuuden takana usein infektio",
      "Lääkemuutokset lähiaikoina? – haittavaikutus tai yhteisvaikutus",
    ],
    assess: ["Systemaattinen ABCDE ja peruselintoiminnot", "Verensokeri, lämpö ja 12-EKG matalalla kynnyksellä", "NEWS2-pisteytys tukee hoidon tarpeen ja kuljetuksen arviota (laskuri Työkaluissa)"],
    actions: ["Hoida löydösten mukaan, seuraa muutoksia", "Matala kynnys konsultaatioon"],
    red: ["Peruselintoimintojen poikkeavuus", "NEWS2 ≥ 5 → kiireellinen hoidon tarve"],
  },
  "771": {
    what: "Sokeritasapainon häiriö (matala/korkea verensokeri).",
    ask: [
      "Insuliini: mikä annos ja milloin pistetty? – annosvirhe tai ajoitus yleinen syy",
      "Jäikö ateria väliin tai myöhästyikö? – hypoglykemian klassinen syy",
      "Liikuntaa tavallista enemmän? – laskee sokeria vielä tuntien päästä",
      "Alkoholia? – estää maksan sokerintuotannon, hypo voi uusia",
      "Aiemmat vakavat hypoglykemiat? Tunteeko hypon tulon? – hypotuntemusten puute = riskipotilas",
    ],
    assess: ["Verensokeri, tajunta ja nielemiskyky", "Ketoasidoosin merkit korkeassa sokerissa"],
    actions: ["Matala sokeri: nopea hiilihydraatti suun kautta jos nielee turvallisesti; muuten i.v.-glukoosi tai glukagoni i.m. hoito-ohjeen mukaan", "Korjauksen jälkeen pitkävaikutteinen hiilihydraatti ja kontrollimittaus – hypo voi uusia (etenkin alkoholi, pitkävaikutteinen insuliini)", "Korkea sokeri + huono vointi: nesteytys ja kuljetus hoito-ohjeen mukaan (ketoasidoosiepäily aina kuljetus)"],
    red: ["Tajuttomuus, ketoasidoosin merkit (Kussmaul-hengitys, asetonin haju)"],
  },
  "772": {
    what: "Kouristelu (epileptinen tai muu).",
    ask: [
      "Kauanko kohtaus kesti / vieläkö kouristaa? – yli 5 min = uhkaava status epilepticus, hoito heti",
      "Tunnettu epilepsia vai ensimmäinen kohtaus? – ensikohtaus vaatii aina jatkoselvittelyn",
      "Onko epilepsialääkitys otettu? – laiminlyönti on tavallisin syy tutulla potilaalla",
      "Valvominen, alkoholi tai sen lopetus? – yleiset laukaisijat",
      "Silminnäkijältä: mistä kohtaus alkoi, symmetrinen? Virtsankarkailu, kielenpurema? – kohtaustyypin tunnistus",
      "Löikö päänsä? Raskaus? – vamma; raskaana eklampsia on suljettava pois",
    ],
    assess: ["Kohtauksen kesto ja toistuvuus", "Verensokeri, lämpö, vammat", "Tajunnan palautuminen (jälkitila)"],
    actions: ["Suojaa potilas, turvaa ilmatie kohtauksen jälkeen", "Pitkittynyt kohtaus → lääkitys hoito-ohjeen mukaan viiveettä (bentsodiatsepiini; ilman suoniyhteyttä bukkaalinen/nasaalinen)"],
    red: ["Kohtaus > 5 min tai toistuva ilman toipumista = status epilepticus"],
  },
  "773": {
    what: "Yliherkkyysreaktio / anafylaksia.",
    ask: [
      "Mille altistui ja milloin? – ruoka, lääke, pistiäinen",
      "Kuinka nopeasti oireet alkoivat? – sekunneissa/minuuteissa alkava = anafylaksia",
      "Aiemmat reaktiot ja niiden vaikeus? Adrenaliinikynä käytössä/käytetty? – riskin ja jo annetun hoidon arvio",
      "Astma perussairautena? – ennustaa vaikeampaa kulkua",
    ],
    assess: ["A/B/C-ongelma (hengitys, verenkierto) ± iho-/limakalvo-oireet", "Muista: anafylaksia voi esiintyä ilman iho-oireita"],
    actions: ["Anafylaksia: i.m. adrenaliini reisilihakseen viiveettä hoito-ohjeen mukaan, toista tarvittaessa", "Poista altiste, asento (hengitys istuen, verenkierto makuulla), happi", "Tukihoito: nesteytys ja muut lääkkeet hoito-ohjeen mukaan"],
    red: ["Hengitysteiden turvotus, vinkuna, matala paine → välitön adrenaliini", "Kaksivaiheinen reaktio mahdollinen → riittävä seuranta"],
  },
  "774": {
    what: "Muu sairastuminen.",
    ask: [
      "Mikä oire ja milloin alkoi? Mikä on muuttunut normaalista? – rajaa syyt",
      "Esitiedot (SAMPLE) ja lääkemuutokset? – tavallisimmat selittäjät",
      "Mitä on jo kokeiltu ja auttoiko? – hoidon vaste kertoo suunnan",
    ],
    assess: ["Oireet ja peruselintoiminnot", "Esitiedot ja lääkitys"],
    actions: ["Oireenmukainen hoito ja seuranta", "Arvioi kuljetus ja hoitolinja"],
    red: ["Peruselintoimintojen häiriö, nopea huononeminen"],
  },
  "775": {
    what: "Oksentelu / ripuli / virtsavaiva.",
    ask: [
      "Kesto ja tiheys? Verta oksennuksessa tai ulosteessa? – vuoto vaatii kiireellisen arvion",
      "Pystyykö juomaan? Virtsamäärät? – kuivuman arvio, erityisesti lapset ja iäkkäät",
      "Muita sairastuneita lähipiirissä? – epidemia/ruokamyrkytys",
      "Diabetes? – oksentelu + korkea sokeri voi olla ketoasidoosi",
      "Kova vatsakipu? – ei sovi tavalliseen vatsatautiin",
    ],
    assess: ["Nestehukan merkit, kesto ja toistuvuus", "Kuume, vatsalöydökset"],
    actions: ["Nesteytys hoito-ohjeen mukaan, oireenmukainen hoito", "Arvioi kuljetus erityisesti iäkkäillä/lapsilla"],
    red: ["Vaikea kuivuma, verinen uloste/oksennus, kova vatsakipu"],
  },
  // ---------- Sairaus (oire) ----------
  "781": {
    what: "Vatsakipu.",
    ask: [
      "Missä kipu on ja millainen se on (SOCRATES)? – sijainti ohjaa erotusdiagnostiikkaa",
      "Äkillinen, repivä, heti maksimaalinen? – vuotava aortta kunnes toisin todistetaan",
      "Raskauden mahdollisuus? – ektooppinen raskaus hedelmällisessä iässä",
      "Oksentelu, ulosteiden kulku, virtsaaminen? – tukos, infektio",
      "Aiemmat vatsaleikkaukset? – kiinnikkeiden aiheuttama tukos",
      "Säteileekö selkään? Helpottaako etukumara? – haimatulehdus, aortta",
    ],
    assess: ["Kivun luonne ja sijainti", "Hemodynamiikka, vatsan systemaattinen tutkimus (inspektio, palpaatio neljänneksittäin, aristus, lautamaisuus)", "Kuume; 12-EKG ylävatsakivussa – alaseinäinfarkti voi oireilla vatsalle"],
    actions: ["Suoniyhteys ja i.v.-kivunhoito hoito-ohjeen mukaan – kivun hoito ei peitä diagnoosia", "Nestehoito hypotensiossa hoito-ohjeen mukaan", "Tunnista kiireellistä leikkausta vaativat tilat, ennakkoilmoitus tarvittaessa"],
    red: ["Kova äkillinen kipu + matala paine (vuotava aortta, ektooppinen)", "Vatsan lautamaisuus"],
  },
  "782": {
    what: "Pää- tai niskakipu.",
    ask: [
      "Räjähtävä alku sekunneissa ('ukkosiskupäänsärky')? – SAV kunnes toisin todistetaan",
      "Erilainen kuin mikään aiempi särky? – uusi tai muuttunut särkytyyppi vaatii selvittelyn",
      "Kuume ja niskajäykkyys? Ihottumaa? – aivokalvontulehduksen merkit",
      "Neurologiset oireet: puhe, näkö, raajojen voima? – rakenteellinen syy",
      "Trauma lähipäivinä? Verenohennus? – kallonsisäinen vuoto voi ilmetä viiveellä",
      "Aura, aiemmat migreenit? – tuttu migreeni vs. uusi särky",
    ],
    assess: ["Alku ja liitännäisoireet", "Neurologinen status, niskajäykkyys, kuume"],
    actions: ["Oireenmukainen hoito", "Vakavan syyn epäily → kiireellinen kuljetus"],
    red: ["Äkillinen kovin päänsärky, neurologinen puutos, kuume + niskajäykkyys"],
  },
  "783": {
    what: "Selkä- tai lonkkakipu.",
    ask: [
      "Virtsaumpi tai -karkailu? Ulosteinkontinenssi? – cauda equina -oireyhtymä on hätätilanne",
      "Ratsupaikka-alueen puutuminen? Molempien alaraajojen heikkous? – cauda equina",
      "Trauma? Osteoporoosi tai pitkä kortisonilääkitys? – murtumaepäily matalaenergisessäkin",
      "Kuume, laihtuminen, syöpähistoria, yö-/lepokipu? – infektion tai kasvaimen merkit",
      "Säteileekö jalkaan? Puutumiset? – hermojuurioire",
    ],
    assess: ["Kivun alku ja mekanismi", "Neurologiset oireet (alaraajat, rakon toiminta)", "Yksittäinen punalippu ei riitä – usean yhtäaikaisuus nostaa vakavan syyn todennäköisyyttä"],
    actions: ["Kivunhoito ja asentohoito", "Arvioi liikuntakyky ja kuljetus"],
    red: ["Ratsupaikka-tunnottomuus, rakon toiminnan häiriö → cauda equina"],
  },
  "784": {
    what: "Raajakipu.",
    ask: [
      "Äkillisesti kylmä, kalpea ja kivulias raaja? – valtimotukos: aikaikkunallinen hätätilanne",
      "Turvotus, punoitus, kuumotus? Pitkä matka tai immobilisaatio? – laskimotukoksen riski",
      "Trauma taustalla? – murtuma/lihasvamma",
    ],
    assess: ["Akuutin iskemian 6 P: Pain (kipu) · Pallor (kalpeus) · Pulselessness (pulssittomuus) · Paresthesia (tuntohäiriö) · Paralysis (halvaus) · Perishing cold (kylmyys)", "Ääreispulssit puolierona, kapillaaritäyttö", "Turvotus, lämpö, trauma"],
    actions: ["Tue raaja, kivunhoito hoito-ohjeen mukaan", "Iskemiaepäily on aikaikkunallinen → kiireellinen kuljetus verisuonikirurgiseen arvioon"],
    red: ["Kylmä, kalpea, pulssiton raaja → valtimotukos", "Kova kipu + jännittynyt aitio → lihasaitio-oireyhtymä"],
  },
  "785": {
    what: "Mielenterveysongelma / psyykkinen kriisi.",
    ask: [
      "Kysy suoraan itsemurha-ajatuksista – kysyminen ei lisää riskiä, vaan avaa keskustelun",
      "Onko suunnitelma, aikomus ja välineet? – mitä yksityiskohtaisempi suunnitelma, sitä suurempi riski",
      "Aiemmat itsemurhayritykset? – merkittävin yksittäinen riskitekijä",
      "Päihteet nyt? – päihtymys madaltaa kynnystä impulsiiviseen tekoon",
      "Somaattiset syyt: verensokeri, hapetus, myrkytys, pään vamma? – sekavuus voi olla elimellinen",
      "Tukiverkko: kuka voi olla seurana, jos ei lähde mukaan? – turvallisuussuunnitelma",
    ],
    assess: ["Itsetuhoisuus ja väkivaltariski", "Somaattisten syiden poissulku"],
    actions: ["Oma turvallisuus, rauhallinen kohtaaminen", "Yhteistyö poliisin kanssa tarvittaessa", "Hoitopaikan ja -linjan valinta; nuorten itsetuhoisuus aina erikoissairaanhoidon arvioon"],
    red: ["Konkreettinen itsetuho-/väkivaltasuunnitelma", "Sekavuus voi olla somaattinen → tutki"],
  },
  "786": {
    what: "Vartalokipu (rinta-/kylki-/yleinen).",
    ask: [
      "Missä kipu on ja liittyykö hengitykseen tai rasitukseen? – pleuraalinen vs. iskeeminen",
      "Trauma, voimakas yskä? – kylkiluu-/lihasperäinen",
      "Sydänoireiden liitännäiset: hikisyys, pahoinvointi? – EKG matalalla kynnyksellä",
    ],
    assess: ["Sydän- ja keuhkoperäisten syiden arvio (EKG, hengitys)", "Kivun luonne (OPQRST)"],
    actions: ["Oireenmukainen hoito, monitorointi", "Vakavien syiden poissulku"],
    red: ["Rintakipu + hengenahdistus + poikkeava EKG/SpO₂"],
  },
  // ---------- Sairaankuljetustehtävä ----------
  "790": {
    what: "Hälytys puhelun aikana – tarkentuva tehtävä.",
    ask: [
      "Mitä hätäkeskus raportoi matkalla? – tilannekuva päivittyy",
      "Onko kohteessa turvallisuusriski? – odota tarvittaessa poliisia",
    ],
    assess: ["Päivittyvät esitiedot ja kohteen tilanne"],
    actions: ["Valmistaudu monenlaiseen tehtävään, varmista turvallisuus"],
    red: ["Tieto vaarallisesta kohteesta → odota poliisia"],
  },
  "791": {
    what: "Synnytys / synnytyksen käynnistyminen.",
    ask: [
      "Monesko raskaus ja synnytys? – aiemmat nopeat synnytykset ennustavat nopeaa",
      "Raskausviikot? Yksi vai useampi sikiö? – ennenaikaisuus ja kaksoset nostavat riskiä",
      "Supistusten tiheys ja kesto? Ponnistamisen tarve? – ponnistustarve = synnytys on käsillä",
      "Onko lapsivesi mennyt ja minkä väristä? – vihreä vesi = mekonium, vauvan ahdinko",
      "Verenvuotoa? Istukan sijainti tiedossa (etinen)? – vuotoriskin arvio",
      "Päänsärky, näköhäiriöt, turvotukset, kouristelu? – pre-eklampsia/eklampsia",
    ],
    assess: ["Synnytyksen vaihe: ehtiikö sairaalaan?", "Äidin vointi ja sikiön liikkeet", "Vastasyntyneen arvio APGAR (1 ja 5 min, 0–2 p/kohta): Appearance (väri) · Pulse (syke) · Grimace (ärtyvyysvaste) · Activity (jäntevyys) · Respiration (hengitys)"],
    actions: ["Valmistaudu synnytykseen ja vastasyntyneen hoitoon", "Vastasyntynyt: kuivaus, lämpö, stimulointi; ventilaatiotuki jos ei hengitä/syke < 100 hoito-ohjeen mukaan", "Kolmas vaihe: seuraa vuotoa, istukka talteen; kohdun hieronta ja hoito-ohjeen mukainen lääkitys runsaassa vuodossa"],
    red: ["Poikkeava tarjonta, napanuora, runsas vuoto, kouristelu (eklampsia)"],
  },
  "792": {
    what: "Varallaolo / valmiussiirto.",
    ask: ["Mikä on valmiuden syy ja kesto? – ennakointi"],
    assess: ["Tehtävän luonne ja valmiusvaatimus"],
    actions: ["Pidä valmius ja välineet kunnossa"],
    red: [],
  },
  "793": {
    what: "Hoitolaitossiirto.",
    ask: [
      "Siirron syy ja potilaan vointi nyt? – kiireellisyys ja valvontataso",
      "Meneillään olevat hoidot ja lääkitykset? – jatkuvuus matkalla",
      "ISBAR-raportti luovuttavalta yksiköltä? – tilanne, tausta, arvio, toimintaehdotus",
    ],
    assess: ["Potilaan vakaus ja siirron syy", "Meneillään olevat hoidot ja monitorointi"],
    actions: ["Riittävä valvonta matkalla, selkeä luovutus (ISBAR)"],
    red: ["Vointi heikkenee matkalla → konsultoi"],
  },
  "794": {
    what: "Muu sairaankuljetus- tai aikatilaustehtävä.",
    ask: ["Kuljetuksen syy ja potilaan liikkumiskyky? – oikea kuljetustapa"],
    assess: ["Potilaan vointi ja kuljetustarve"],
    actions: ["Tarpeenmukainen seuranta ja kirjaus"],
    red: ["Odottamaton huononeminen"],
  },
  "796": {
    what: "Monipotilastilanne / suuronnettomuus.",
    ask: [
      "METHANE-raportti johdolle – M = Major incident (suuronnettomuusilmoitus tehty?) · E = Exact location (tarkka sijainti) · T = Type (tapahtumatyyppi) · H = Hazards (vaarat nyt ja kehittyvät) · A = Access (kulkureitit ja tulokynnys) · N = Number (potilasmäärä ja vakavuus) · E = Emergency services (tarvittavat lisäresurssit)",
      "Jatkuuko vaara (liikenne, kemikaali, väkivalta)? – oma turvallisuus ensin",
    ],
    assess: ["Tilannearvio ja potilaiden määrä/vakavuus", "Oma turvallisuus ja työnjako"],
    actions: ["Triage ja priorisointi, johtaminen", "Lisäresurssit ja raportointi johdolle"],
    red: ["Resurssit alimitoitetut → triage ja lisäavun hälytys etusijalla"],
  },
};

// X-koodien yhteinen tietosisältö (ei kuljetusta).
export const X_INFO = {
  what: "Tehtävä, jossa potilasta ei kuljeteta. Huolellinen tutkiminen, päätöksen perustelu ja jatko-ohjeet korostuvat.",
  ask: [
    "Miksi apua pyydettiin juuri nyt? – alkuperäinen huoli on ratkaistava, muuten tehtävä uusiutuu",
    "Ymmärtääkö potilas tilanteensa ja päätöksensä seuraukset? – päätöskyvyn arvio kuuluu kirjaukseen",
    "Kuka jää seuraamaan vointia? – yksin asuvan turvaverkko",
    "Milloin ja mihin pitää soittaa uudelleen? – konkreettiset jatko-ohjeet ääneen ja kirjallisesti",
  ],
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
