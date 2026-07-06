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
    actions: ["Laadukas painelu (100–120/min, 5–6 cm), tauot alle 5 s", "Defibrilloi VF/pVT viiveettä, jatka 2 min jaksoissa rytmintarkistuksin", "Ilmatien varmistus (supraglottinen väline tai intubaatio) ja kapnografia; ventilaatio 10/min ilman hyperventilaatiota", "Suoniyhteys tai i.o. – adrenaliini ja amiodaroni hoito-ohjeen rytmityksellä", "Käy läpi palautuvat syyt 4H + 4T ja hoida löydetty syy", "TRAUMAATTINEN sydänpysähdys (TCA) ei ole tavallinen ALS-elvytys: hoidettavat syyt edellä (HOTT: Hypovolemia – vuoto kiinni ja volyymi · Oxygenation – ilmatie ja 100 % happi · Tension – pleuradekompressio ohjeen mukaan · Tamponade – lääkäriyksikkö). Painelu resurssien mukaan, mutta se ei korjaa tyhjää sydäntä. Aktiivihoito mielekkäintä, jos viimeisistä elonmerkeistä alle ~15 min", "Raskaana (puolivälin jälkeen): normaali elvytysprotokolla ja energiat + kohdun manuaalinen siirto vasemmalle (laskimopaluu), varhainen ilmatien varmistus (nopea desaturaatio); konsultoi varhain – hätäsektio voi olla äidin ja sikiön selviytymisen kannalta ratkaiseva"],
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
      "Pleuriittinen (hengitykseen liittyvä) kipu, veriyskä, synkope? Tukosriskit: immobilisaatio, pitkä matka, tuore leikkaus, syöpä, raskaus, e-pillerit? Toispuoleinen jalan turvotus? – keuhkoemboliaepäily; auskultaatio voi olla niukka",
    ],
    assess: ["Hengitystaajuus, SpO₂, hengitystyö ja apulihakset", "Hengitysäänet auskultoiden (vinkuna, rahina, hiljaisuus – 'hiljainen rintakehä' on hälytysmerkki)", "Puhekyky kokonaisin lausein; EtCO₂ tarvittaessa", "Vaikeusarvio: taajuus, syke, tajunta, uupumus"],
    actions: ["Asentohoito (puoli-istuva), rauhoittaminen", "Lisähappi tavoitesaturaatioon (COPD: hallitusti, tavoite 88–92 %)", "CPAP keuhkopöhössä, NIV-valmius hoito-ohjeen mukaan", "Syynmukainen lääkitys (inhaloitavat, i.v.-lääkkeet) hoito-ohjeen mukaan", "12-EKG jos sydänperäinen syy mahdollinen"],
    red: ["Uupuminen, hiljenevät hengitysäänet, laskeva SpO₂ → uhkaava hengityksen pysähdys", "COPD + uneliaisuus → hiilidioksidiretentio", "Äkillinen hengenahdistus + takykardia + hypoksia ilman muuta selitystä (± synkope, tukosriski) → keuhkoembolia: varovainen nesteytys, konsultoi"],
  },
  "704": {
    what: "Rintakipu, jonka taustalla voi olla sydänperäinen syy (ACS).",
    ask: [
      "OPQRST-runko kipuanamneesiin – O = Onset (alku: milloin, mitä tehdessä, äkillinen vai vähittäinen) · P = Provocation/Palliation (mikä pahentaa tai helpottaa: rasitus, asento, hengitys, nitro) · Q = Quality (luonne: puristava, painava, terävä, repivä) · R = Radiation (säteily: käsi, kaula, leuka, selkä) · S = Severity (voimakkuus NRS 0–10) · T = Time (kesto ja muutos ajassa)",
      "Puristava, painava, laaja-alainen retrosternaalinen kipu? – tyypillinen ACS-kipu",
      "Alkamisaika tarkasti? – ratkaisee reperfuusiohoidon ikkunat",
      "Hikisyys, pahoinvointi, hengenahdistus? – autonomiset liitännäisoireet nostavat riskiä",
      "Aiempi sepelvaltimotauti, PCI/ohitus? Auttoiko nitro? – tunnettu tauti + tuttu kipu",
      "Riskitekijät: tupakointi, diabetes, verenpaine, dyslipidemia, sukurasite, munuaisten vajaatoiminta? – riskiarvio",
      "Erektiolääke (sildenafiili, tadalafiili, vardenafiili) viime päivinä? – PDE5-estäjä on nitraatin vasta-aihe",
      "Tukosriskit: immobilisaatio, pitkä matka, leikkaus, syöpä, raskaus? Pleuriittinen kipu, veriyskä? – keuhkoemboliaepäily",
      "Repivä, heti alussa maksimaalinen kipu selkään? Puoliero paineissa/pulsseissa? – aortan dissekaation epäily",
    ],
    assess: ["12-kanavainen EKG mahdollisimman varhain (tavoite 10 min); toista jos kipu muuttuu tai kuva epäselvä – merkitse otettiinko kivun aikana vai kivuttomana", "Lisäkytkennät: V4R jos alaseinä-STEMI tai hypotensio (oikean kammion infarkti); V7–V9 jos V1–V3:ssa ST-lasku + korkea R (takaseinäinfarkti)", "Laaja ST-lasku useissa kytkennöissä + aVR-nousu → mahdollinen päärunkotauti; LBBB/tahdistin + vahva kliininen kuva → konsultoi (Sgarbossa)", "Normaali EKG ei sulje ACS:ää pois – vahva oirekuva ratkaisee", "Muista: iäkkäillä, diabeetikoilla ja naisilla epätyypilliset oireet (väsymys, huono olo) ovat yleisiä"],
    actions: ["Jatkuva rytmiseuranta, defibrillaatiovalmius; suoniyhteys", "Happi vain tarpeeseen: ei rutiinihappea normoksiselle – anna jos SpO₂ matala, sokki tai keuhkopöhö", "ASA ja muu antitromboottinen hoito-ohjeen mukaan; nitraatin varoitukset: hypotensio, oikean kammion infarkti, PDE5-estäjät", "Hoida kova kipu – kipu lisää hapenkulutusta", "STEMI-epäily: EKG:n lähetys/konsultaatio, ennakkoilmoitus ja kuljetus PCI-valmiuteen"],
    red: ["ST-nousut EKG:ssa (tai takaseinän peilikuva V1–V3:ssa)", "Matala paine, rytmihäiriö, kylmänhikisyys → suuririskinen", "Tappavat erotusdiagnoosit: dissekaatio (repivä kipu, puoliero), keuhkoembolia (pleuriittinen kipu, takykardia, tukosriski), paineilmarinta, tamponaatio, sepsis"],
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
    assess: ["12-kanavainen EKG ja jatkuva monitorointi", "Epävakauden kriteerit: hypotensio, tajunnan häiriö, iskeeminen rintakipu, keuhkopöhö – yksikin riittää", "Nopea luokittelu: kapea + epäsäännöllinen → eteisvärinä · kapea + säännöllinen → SVT tai flutteri 2:1 (~150/min) · leveä + säännöllinen → VT kunnes toisin osoitettu · leveä + epäsäännöllinen → FA + haarakatkos/WPW tai polymorfinen VT", "Bradykardiassa etsi syy: infarkti (alaseinä), lääkkeet (beeta-/kalsiumsalpaaja, digoksiini), hyperkalemia, hypotermia, kohonnut kallonsisäinen paine"],
    actions: ["Epävakaa takykardia → sähköinen kardioversio hoito-ohjeen mukaan", "Vakaa SVT: vagaaliset manööverit, adenosiini hoito-ohjeen/konsultaation mukaan", "Leveä + epäsäännöllinen (FA + WPW?): ÄLÄ anna AV-solmuketta salpaavia lääkkeitä ilman varmuutta – konsultoi, epävakaa hoidetaan sähköllä", "Oireinen bradykardia → lääke- ja tahdistusvalmius hoito-ohjeen mukaan", "Dokumentoi rytmi EKG:lle ennen ja jälkeen hoidon"],
    red: ["Epävakauden merkit → välitön hoito", "Leveäkompleksinen takykardia → suhtaudu kammioperäisenä", "Mobitz II, korkea-asteinen AV-katkos tai totaaliblokki → voi edetä äkisti, tahdistusvalmius ja konsultaatio", "Synkope + rytmihäiriö/rintakipu = korkean riskin potilas"],
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
    what: "Hukkuminen / hukuksiin joutuminen. Hypoksinen tapahtuma – hoidon ydin on happeutumisen palauttaminen.",
    ask: [
      "Kauanko veden alla tai vedessä? – lämpimässä vedessä ennuste heikkenee ~10 min jälkeen; yli 30 min uponneena ennuste on huono veden lämmöstä riippumatta",
      "Veden lämpötila? – hyvin kylmä vesi (< ~10 °C) voi jäähdyttää suojaavasti ennen hypoksiaa: lapsilla selviytymisiä jopa 45–60 min jääkylmästä vedestä → elvytä pitkään",
      "Sukellus tai hyppy matalaan? Edeltävä sairauskohtaus? – kaularankavamma tai kohtaus hukkumisen syynä",
      "Miten pelastettiin ja elvytettiinkö? – tapahtumaketju ja viiveet",
      "Laitesukellus ja nopea pintaan nousu? – sukeltajantaudin mahdollisuus, konsultoi ylipainehappihoidosta",
    ],
    assess: ["Hengitys ja happeutuminen", "Ydinlämpö (hypotermia)", "Rankavamma vain jos mekanismi sopii – ei rutiinituentaa"],
    actions: ["Eloton: aloita 5 alkupuhalluksella ennen painelua (hypoksinen elottomuus), muuten elvytys tavalliseen tapaan", "Ilmatie tyhjennetään vedestä ja eritteistä valuttamalla/imulla; hapetus ja ventilaatio etusijalla", "CPAP/NIV varoen: mahassa on yleensä vettä ja oksentamisherkkyys suuri", "Estä jäähtyminen, riisu märät vaatteet", "Kylmästä vedestä pelastettu eloton → harkitse kuljetusta elvyttäen ECMO-valmiuteen (yliopistosairaala), ennakkoilmoitus", "Kuljeta seurantaan myös vähäoireinen ja nopeasti toipunut – keuhkopöhö voi kehittyä tuntien viiveellä"],
    red: ["Hypotermia + eloton → elvytä, lämmitä ('ei kuollut ennen kuin lämmin ja kuollut')", "Hyväkuntoisenkin hengitysoireet voivat alkaa viiveellä → matala kuljetuskynnys"],
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
    assess: ["Vammamekanismi ja putoamiskorkeus; 5 sekunnin yleissilmäys ovelta (tajunta, hengitys, massiivivuoto, ihon väri)", "Blood sweep: kädet potilaan ympärille ja alle – kainalot, nivuset, kaula, selkä, pakarat ja alusta", "cABCDE, rangan ja lantion arvio; sokki-indeksi > 1 (syke > systolinen RR) = vuotosokin merkki", "Rangan tuennan tarve (NEXUS-tyyppiset kriteerit): keskilinjan aristus, neurologinen puutos, alentunut tajunta, päihtymys tai kivulias muu vamma → tue", "Tajunta ja raajojen liike/tunto"],
    actions: ["Hallitse henkeä uhkaava vuoto ensin (paine → painepakkaus → kiristysside)", "Lantiovyö, jos mekanismi tai löydös viittaa lantionmurtumaan", "Tue ranka ja immobilisoi kriteerien täyttyessä – tuenta ei saa viivyttää henkeä pelastavaa hoitoa", "Suoniyhteys ja kivunhoito hoito-ohjeen mukaan; lämpötalous heti alusta (hypotermia pahentaa hyytymishäiriötä)", "Aivovammaepäilyssä: estä hypoksia ja hypotensio, pää neutraaliasentoon, GCS ja pupillit toistuvasti", "Estä jäähtyminen, nopea kuljetus traumayksikköön ('load and go' epävakaalla) ja varhainen ennakkoilmoitus"],
    red: ["Korkea energia, lantio-/reisivamma, neurologinen puutos", "Sokki-indeksi > 1, kalpea ja kylmänhikinen → sisäinen vuoto kunnes toisin osoitettu"],
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
    actions: ["Suora paine → painepakkaus → kiristysside raajaan tarvittaessa; henkeä uhkaavassa vuodossa kiristyssidettä ei löysätä kentällä", "Hemostaattinen sidos taivealueille", "AMPUTAATIO: hoida tynkä (paine, paineside, tarvittaessa kiristysside) – amputaatti viileänä ja kuivumiselta suojattuna, EI suoraan jäihin eikä veteen, aina potilaan mukaan", "Osittain kudoskielekkeellä kiinni olevaa osaa EI leikata irti; kentällä ei arvioida replantaation toivottomuutta", "Replantaation aikaikkunat karkeasti: lihasta sisältävä osa ~8 h, muu (esim. sormi) ~16 h – ilmoita hoitopaikkaan etukäteen (replantaatiopäivystys keskitetty: HYKS, TAYS, OYS)"],
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
    assess: ["Kaatumisen syy (mekaaninen vai sairauskohtaus)", "Vammat: lonkka, ranne, pää", "Ortostatismi, rytmi, verensokeri syyn arviossa", "Aivovammapotilaan tavoitteet: SpO₂ > 94 %, SAP > 120 mmHg, normoventilaatio (EtCO₂ ~4–4,5 kPa), normoglykemia", "Aivovamma EI lähtökohtaisesti selitä hypotensiota – matala paine → etsi vuotoa muualta"],
    actions: ["Tutki vammat ja syy, kivunhoito hoito-ohjeen mukaan", "Aivovammaepäilyssä kuljetus pääpuoli 20–30° koholla, pää suorassa, kaulalaskimot vapaina (ei kiristävää tuentaa/kiinnitystä – kova kauluri varoen, tuenta mieluummin käsin/tyhjiöpatjalla)", "Arvioi kuljetus ja kotipärjääminen", "Kotiseuranta pään vammassa vain jos: ei tajuttomuutta tai muistiaukkoa, ei neurologisia oireita, ei oksentelua/kovaa päänsärkyä, ei antikoagulaatiota JA seuranta kotona on mahdollista + kirjalliset ohjeet"],
    red: ["Pään vamma + verenohennuslääkitys", "Taustalla pyörtyminen/rytmihäiriö", "GCS laskee ≥ 2 pistettä, toistuva oksentelu tai kouristus → kiireellinen kuljetus, lääkäriyksikkö"],
  },
  "746": {
    what: "Isku / törmäys kehoon.",
    ask: [
      "Mihin osui ja millä voimalla/välineellä? – energia ja sisäelinvamman riski",
      "Lisääntyykö vatsan tai rinnan kipu? – kehittyvä sisäinen vuoto",
      "Verenohennus? – vuotoriski",
    ],
    assess: ["Iskun kohta, energia ja oireet", "Sisäelinvamman mahdollisuus", "Lävistävässä vammassa: paineilmarinnan ja sydäntamponaation mahdollisuus (rintakehä/ylävatsa)"],
    actions: ["cABCDE, seuraa hemodynamiikkaa", "Lävistävää esinettä EI poisteta eikä haavaa sondeerata – tue esine paikoilleen ja kuljeta", "Permissiivinen paineeen taso vuotavalla: rannesyke/tajunta riittää ilman aivovammaa – vältä ylinesteytystä; aivovammassa SAP > 120", "Kivunhoito ja immobilisaatio tarpeen mukaan; lämpötalous", "Lävistävät vartalovammat kuljetetaan aina, myös oireettomat"],
    red: ["Vatsan/rinnan tylpän vamman jälkeinen huononeminen", "Lävistävä vartalovamma + sokki → load and go, ennakkoilmoitus"],
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
    actions: ["Poista altistuksesta turvallisesti", "Anna 100 % happea; häkäoksimetri jos käytettävissä (SpO₂ ei erota häkähemoglobiinia)", "Suljetun tilan palo (muovi, tekstiilit) + tajunnan lasku, hypotensio tai kouristelu → epäile myös syanidimyrkytystä: antidootti ensihoitolääkärin konsultaation mukaan", "Kuljetus; ylipainehappihoidon tarve konsultoiden (häkäpitoisuuden perusteella)"],
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
    what: "Sähköisku tai salamanisku.",
    ask: [
      "Mikä jännite: taloussähkö (230 V) vai suurjännite? – suurjännite = aina korkea riski ja aina sairaalaan, vaikka oireeton",
      "Virran reitti: kädestä käteen tai rintakehän läpi? Kauanko kiinni virtalähteessä? – rytmihäiriöriski",
      "Heittikö irti, kaatuiko, löikö päänsä? – liitännäisvammat",
      "Rytmituntemuksia, rintakipua tai tajuttomuutta tapahtuman jälkeen? – seurannan tarve",
      "Sydämentahdistin tai rytmihäiriötahdistin? – aina sairaala-arvio",
    ],
    assess: ["Jännite ja virran reitti; sisäänmeno-/ulostulovammat", "EKG ja rytmi", "Korkeajännitteessä ulkoiset löydökset EIVÄT kerro sisäisten vammojen laajuutta", "Suurjännite: muista valokaarivaara – useiden metrien turvaväli (esim. junaradan ajojohtimet)"],
    actions: ["Varmista virrattomuus ennen koskemista", "Eloton: elvytys tavalliseen tapaan – salamaniskun/sähkön asystolia voi olla hyväennusteinen, myös pelkkä hengityspysähdys ilman sydänpysähdystä on mahdollinen → ventiloi", "Monitorointi ja rytmiseuranta; hoida palovammat ja muut vammat", "Taloussähköisku (230 V), oireeton, ei tajuttomuutta ja vain hetkellinen kontakti → ei välttämättä tarvitse päivystystä; kirjaa huolella ja anna selkeät ohjeet"],
    red: ["Rytmihäiriö, tajuttomuus, suurjännite, raskaus tai tahdistin → sairaalaseuranta", "Märkä iho ja pitkittynyt kontakti pahentavat vammaa"],
  },
  "754": {
    what: "Palovamma (kuumuus, kemikaali, sähkö).",
    ask: [
      "Mikä paloi ja missä tilassa? Suljettu tila? – hengitystiepalovamman ja häkäaltistuksen riski",
      "Kuinka kauan altistui ja onko jäähdytys aloitettu? – jäähdytyksen hyöty ensimmäisinä minuutteina",
      "Räjähdys mukana? – paineaaltovammat",
    ],
    assess: ["Laajuus 9 %:n säännöllä (aikuinen: pää 9, yläraaja 9, alaraaja 18, vartalon etu/taka 18+18, genitaalit 1); potilaan kämmen sormineen ≈ 1 %", "LAAJA palovamma: aikuisella > 20 %, lapsella > 10 % kehon pinta-alasta", "Syvyys: pinnallinen (punoitus, kipu) vs. syvä (vaalea/hiiltynyt, tunnoton); kovettunut liekkipalovamma on aina syvä", "Hengitystiepalovamman merkit: kasvojen/kaulan syvä vamma, käheys, stridor, noki limakalvoilla, turvotus"],
    actions: ["Pieniä vamma-alueita voi jäähdyttää haalealla vedellä – LAAJOJA EI jäähdytetä hypotermiariskin vuoksi; estä jäähtyminen aktiivisesti", "Hapetus (laajassa 100 % happi); hengitystie-epäilyssä varaudu varhaiseen ilmatien varmistukseen – turvotus pahenee nopeasti", "Suljetun tilan palo + tajunnan lasku/hypotensio/kouristelu → epäile häkä- JA syanidimyrkytystä (muovi, tekstiilit); SpO₂ voi näyttää virheellisen hyvää – antidootti ja ylipainehappi konsultaation mukaan", "Suoniyhteys, nestehoito laajassa vammassa ja kivunhoito (usein i.v.-opioidi) hoito-ohjeen mukaan; kuuman veden aiheuttamassa nestehoitoa harvoin tarvitaan kentällä", "Peitä puhtain taitoksin / tarttumattomalla kalvolla", "Laaja/syvä vamma, hengitystie-epäily tai nivel-/genitaalialueen vamma → palovammakeskuksen konsultaatio"],
    red: ["Hengitystiepalovamma, laaja palovamma, suljettu tila", "Sähköpalovamma suurjännitteestä: pienet ulkoiset löydökset eivät poissulje isoja sisäisiä vaurioita"],
  },
  "755": {
    what: "Ylilämpöisyys (lämpöuupumus / lämpöhalvaus).",
    ask: [
      "Olosuhteet ja altistuksen kesto? Rasitus? – lämpöhalvauksen riski",
      "Onko juonut ja mitä? – nestehukan arvio",
      "Lääkitys: diureetit, psyykenlääkkeet, antikolinergit? – heikentävät lämmönsäätelyä",
    ],
    assess: ["Ydinlämpö, tajunta ja iho", "Nestehukan merkit", "Erota: saunassa pyörtyminen normaalilla ydinlämmöllä ≠ lämpöhalvaus – jälkimmäinen vaatii aina kuljetuksen"],
    actions: ["Lopeta lämpöaltistus heti, viilennä aktiivisesti (viileä vesi, pyyhkeet) kunnes ydinlämpö lähestyy normaalia", "Nesteytys viileillä nesteillä hoito-ohjeen mukaan, verenkiertoa seuraten", "Korjaa matala verensokeri; saunatilanteessa huomioi mahdollinen hengitystiepalovamma"],
    red: ["Tajunnan häiriö + korkea lämpö → lämpöhalvaus, hätätilanne"],
  },
  "756": {
    what: "Paleltuminen / alilämpöisyys (hypotermia).",
    ask: [
      "Kauanko kylmässä ja millaisissa olosuhteissa (märkä, tuuli, vesi)? – jäähtymisnopeus",
      "Milloin viimeksi nähty tai varmuudella elossa? – alle ~2 h sitten elossa ollut hypoterminen eloton on usein elvytettävissä",
      "Alkoholi tai lääkkeet? – yleisin taustatekijä; hypotermialle altistanut syy (kohtaus, AVH, hypoglykemia, myrkytys, vamma) on myös etsittävä ja hoidettava",
    ],
    assess: ["Aste karkeasti: LIEVÄ = tajuissaan, asiallinen, lihasvärinä · KESKIVAIKEA = sekava, värinä loppunut, iho viileä keskivartalolta · SYVÄ = tajuton/reagoimaton, vatsa kylmä", "Syke ja hengitys tunnustellaan syvässä hypotermiassa pidempään (jopa 1 min) ennen elottomaksi toteamista", "Ydinlämpö ja rytmi; paleltumavammat raajoissa"],
    actions: ["Käsittele varovasti ja vaakatasossa – liikuttelu voi laukaista kammiovärinän; nielua ei ärsytetä turhaan", "Estä lisäjäähtyminen (märät pois, eristys, aktiivinen keskivartalon lämmitys hoito-ohjeen mukaan); huomioi jälkijäähtyminen (afterdrop)", "Eloton + VF: defibrilloi kerran – ellei vastetta, siirry kuljettamaan elvyttäen; mekaaninen painelulaite on kuljetuselvytyksessä käytännössä välttämätön", "Elvytyslääkkeitä ei alle 30 °C ydinlämmössä; 30–35 °C välillä antovälit harvennetaan hoito-ohjeen mukaan", "Syvästi hypoterminen eloton → kuljetus elvyttäen ECMO-valmiuteen (yliopistosairaala), ennakkoilmoitus sydän-keuhkokoneen tarpeesta", "Korjaa matala verensokeri; hoida altistanut syy"],
    red: ["Vaikea hypotermia → varovainen käsittely, pitkä elvytys mahdollinen – ei kuollut ennen kuin lämmin ja kuollut", "PEA-näköinen hidas rytmi voi ylläpitää verenkiertoa syvässä hypotermiassa – vältä tarpeetonta painelua jos elonmerkkejä"],
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
    assess: ["Vuodon lähteen päättely: kirkas verioksennus → ruokatorvi · kahvinporomainen tai kirkas → maha/pohjukaissuoli · pelkkä melena (musta uloste) → ylempi suolisto · kirkas veri peräsuolesta → alempi suolisto", "Verioksentelu + samanaikainen melena = runsas vuoto", "Hemodynamiikka ja sokin merkit: rannesyke ei tunnu, viileä iho, tajunnan lasku", "Veriaspiraation riski tajunnanhäiriöisellä"],
    actions: ["Ilmatien turvaaminen, asentohoito", "Kaksi suoniyhteyttä; sokissa nopeat nestebolukset tavoitteeseen (rannesyke tuntuu / tajunta kohenee) hoito-ohjeen mukaan – vältä ylinesteytystä", "Traneksaamihappo runsaassa vuodossa hoito-ohjeen mukaan; verituotteet alueellisen ohjeen mukaan", "Estä jäähtyminen; nopea kuljetus (tähystystarve) ja ennakkoilmoitus"],
    red: ["Runsas tuore veri + matala paine → henkeä uhkaava", "Maksasairaus/alkoholi + verioksennus → laskimolaajentumavuoto, romahtaa nopeasti"],
  },
  "762": {
    what: "Gynekologinen tai urologinen verenvuoto. Muista: potilas ei välttämättä tiedä olevansa raskaana.",
    ask: [
      "Raskauden mahdollisuus? Viimeisimmät kuukautiset? – kohdunulkoinen raskaus on suljettava pois",
      "Vuodon määrä (siteitä/tunti, hyytymät) ja väri (kirkas/tumma)? – konkretisoi runsauden ja tuoreuden",
      "Kivun luonne: kouristava, toispuoleinen, jatkuva vai aaltomainen? – toispuoleinen alavatsakipu viittaa kohdunulkoiseen",
      "Hartiapistos tai pyörtyminen? – vatsaontelon sisäisen vuodon ärsytysoire (kohdunulkoinen, munatorven repeämä)",
      "Raskausviikot, jos raskaana? – yli 22 vk vuoto on aina vakava: ablaatio vs. etinen istukka",
      "Yli 22 vk: kohtu pehmeä vai jatkuvasti pinkeä/kova? Sikiön liikkeet? – pinkeä ja arka kohtu viittaa istukan irtoamiseen",
      "Tiedossa etinen istukka (placenta praevia)? – tyypillisesti kivuton kirkas vuoto; ÄLÄ tee sisätutkimusta",
      "Trauma, isku vatsaan tai yhdyntä ennen vuotoa? – laukaiseva tekijä",
      "Kuume tai pahanhajuinen vuoto? – infektio/sepsis (keskenmenon yhteydessä)",
    ],
    assess: ["Vuodon määrä, raskauden mahdollisuus", "Hemodynamiikka – sokki voi kehittyä vaikka ulkoinen vuoto näyttää vähäiseltä (vuoto kohtuun/vatsaonteloon)", "Keskenmeno = raskauden päättyminen ennen 22. viikkoa, yleisintä ennen 12. viikkoa: kuukautisia runsaampi vuoto, hyytymät, kouristava alavatsakipu"],
    actions: ["Tukihoito ja sokin hoito hoito-ohjeen mukaan, suoniyhteys matalalla kynnyksellä", "Raskauden puolivälin jälkeen: hoida ja kuljeta vasemmassa kylkiasennossa", "Ei sisätutkimusta ensihoidossa", "Raskaus + vuoto → kiireellinen kuljetus ja ennakkoilmoitus synnytyssairaalaan"],
    red: ["Kouristava/toispuoleinen alavatsakipu + hartiapistos + pyörtyminen/sokki → kohdunulkoinen raskaus, mahdollinen massiivi sisäinen vuoto", "Yli 22 vk: jatkuva kipu + pinkeä kova kohtu → istukan irtoaminen; kivuton kirkas vuoto → etisistukka", "Kova alavatsakipu joka äkisti helpottaa → sokki: kohdun repeämä (riski: aiempi sektio)", "Sokin merkit suhteessa vähäiseen näkyvään vuotoon"],
  },
  "763": {
    what: "Verenvuoto korvasta tai nenästä.",
    ask: [
      "Trauma vai spontaani? – trauman jälkeinen korvavuoto viittaa kallonpohjan vammaan",
      "Verenohennuslääkitys tai verenpainetauti? – pitkittyneen vuodon taustat",
      "Kauanko vuotanut ja mitä on jo kokeiltu? – jatkotoimien valinta",
    ],
    assess: ["Vuodon syy ja määrä, verenpaine", "Trauma vai spontaani"],
    actions: ["Nenäverenvuoto: etukumara asento, nenäsiipien painanta (väh. 10–15 min yhtäjaksoisesti), kylmää niskaan – tavoitteena tyrehdytys niin ettei kuljetusta tarvita", "Asettunut nenäverenvuoto, joka ei ala uudelleen → ei yleensä päivystystarvetta; runsas/toistuva tai antikoaguloidun vuoto → päivystys", "Korvavuoto trauman jälkeen → epäile kallonpohjan vammaa"],
    red: ["Pään vamman jälkeinen korva-/nenävuoto", "Leikkauksen jälkivuoto (erityisesti nielu-/kitarisaleikkaus) → aina päivystysarvio, veriaspiraation riski"],
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
    actions: ["Suojaa potilas, turvaa ilmatie kohtauksen jälkeen", "Pitkittynyt kohtaus → lääkitys hoito-ohjeen mukaan viiveettä (bentsodiatsepiini; ilman suoniyhteyttä bukkaalinen/nasaalinen)", "Raskaana olevan kouristelu = eklampsia kunnes toisin osoitettu: vasen kylkiasento, rauhallinen ympäristö (vältä kirkkaita valoja); magnesium on ensisijainen lääke hoito-ohjeen/konsultaation mukaan – ennakkoilmoitus"],
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
    assess: ["Itsetuhoisuus ja väkivaltariski", "Somaattisten syiden poissulku", "Tahdosta riippumattoman hoidon (mielenterveyslaki) edellytykset täysi-ikäisellä – KAIKKI kolme yhtä aikaa: 1) mielisairaus, 2) hoitamatta jättäminen pahentaisi sairautta tai vaarantaisi vakavasti hänen tai muiden terveyden/turvallisuuden, 3) muut palvelut eivät riitä. Alaikäisellä riittää vakava mielenterveyden häiriö + hoidon tarve"],
    actions: ["Oma turvallisuus, rauhallinen kohtaaminen – ensisijainen työkalu on puhuminen ja kuunteleminen", "Virka-apu: jos tahdonvastainen toimittaminen vaatii poliisia, konsultoi virkasuhteista lääkäriä – virka-apupyynnön tekee lääkäri", "Tahdonvastainen rauhoittava lääkitys vain huolellisella harkinnalla ja lääkärin konsultaatiolla", "Hoitopaikan ja -linjan valinta; nuorten itsetuhoisuus aina erikoissairaanhoidon arvioon"],
    red: ["Konkreettinen itsetuho-/väkivaltasuunnitelma", "Sekavuus voi olla somaattinen → tutki", "Psykoosi, itsemurhayritys tai huumeiden vaikutus – ensihoitoa useimmin tarvitsevat ryhmät"],
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
    what: "Synnytys / synnytyksen käynnistyminen. Matkasynnytyksen vaiheistettu toimintaohje alla (Selvitä → Tutki → Valmistaudu → Ponnistusvaihe → Syntymän jälkeen).",
    // 1. SELVITÄ – haastattelu (+ neuvolakortti kun kiireellisyys arvioitu)
    ask: [
      "Raskauden kesto (viikot) ja laskettu aika? – ennenaikaisuus (< 37+0, erityisesti < 32 vk) nostaa riskiä",
      "Yksi- vai monisikiöinen? Tiedossa oleva tarjonta (päätila/perätila/poikkitila) ja istukan sijainti (etinen)? – neuvolakortista, kun kiireellisyys on arvioitu",
      "Monesko raskaus ja synnytys (G/P)? Aiempien synnytysten kulku, kesto ja synnytystapa? – nopeat alatiesynnytykset ennustavat nopeaa; aiempi sektio/kohtuleikkaus = repeämäriski",
      "Mahdolliset poikkeamat raskauden kulussa ja tiedossa olevat riskit? – pre-eklampsia, raskausdiabetes, vuodot, istukkaongelmat",
      "Supistukset: tiheys, kesto, säännöllisyys? Pystyykö puhumaan supistuksen aikana? – puhumattomuus supistuksen aikana viittaa pitkällä olevaan synnytykseen",
      "Ponnistamisen tarve, paine peräsuoleen, 'kakkahädän' tunne? – synnytys on käsillä",
      "Onko lapsivesi mennyt: milloin ja minkä väristä (kirkas/verinen/vihreä)? – vihreä = mekonium, vauvan ahdinko",
      "Verenvuotoa: määrä, väri, hyytymät? – runsas vuoto on hätätilanne",
      "Kivun luonne: aaltomainen supistuskipu vai jatkuva kipu? – jatkuva kova kipu ei kuulu normaaliin synnytykseen (ablaatio/ruptura)",
      "Sikiön liikkeet normaalit? – liikkeiden väheneminen on hälytysmerkki",
      "Trauma, kaatuminen tai vatsaan kohdistunut isku ennen oireita? – istukan irtoamisen riski",
      "Päänsärky, näköhäiriöt, ylävatsakipu, turvotukset, kouristelu? – pre-eklampsia/eklampsia",
    ],
    // 2.–5. vaihe: matkasynnytyksen toimintaprotokolla
    steps: [
      { t: "2. Tutki ja päätä", items: [
        "Ponnistuttaako? Jos kyllä → kuljetus viiveettä",
        "Katso housuihin/perineumille: näkyykö pää, perä, raaja, iso lapsivesipussi tai napanuora? Vuotoa? – älä tee sisätutkimusta ensihoidossa",
        "Näkyykö tarjoutuva osa? Jos näkyy → synnytys hoidetaan kohteessa ja hälytä lisäapu!",
        "Jos ei synny heti → kuljetus VASEMMASSA KYLKIASENNOSSA (raskauden puolivälin jälkeen selinmakuu painaa alaonttolaskimoa); ennakkoilmoitus jos punaisia lippuja",
        "Kohtu supistusten välillä: pehmeä (normaali) vai jatkuvasti pinkeä/kova ja arka (ablaatioepäily)?",
      ]},
      { t: "3. Valmistautuminen synnytyksen avustamiseen", items: [
        "Imukykyistä alustaa synnyttäjän alle",
        "Suoniyhteys, jos aikaa",
        "Synnytysvälineistö esille: napanuoraklipsit/sulkijat, sakset, kuivia pyyhkeitä",
        "Vastasyntyneen lämpötalous valmiiksi: pyyhkeet, pipo, peitto/lämpöpeite",
        "Vastasyntyneelle sopiva imu, palje ja maski valmiiksi varmuuden vuoksi",
      ]},
      { t: "4. Ponnistusvaiheen hoito", ord: true, items: [
        "Hoida synnytys mieluiten sängyssä: asento puoli-istuva tai kylkiasento, lantio auki. Anna synnyttäjän tehdä työnsä rauhassa",
        "Ohjaa synnyttäjää ponnistamaan vasta, kun hänellä on siihen pakonomainen tarve",
        "Supistuksen aikana ponnistetaan 3–5 kertaa",
        "Puutu aktiivisesti vasta kun pää alkaa syntyä: tue toisella kädellä välilihaa ja hidasta pään syntymistä painamalla koko kämmenellä kevyesti vastaan, ettei pää 'ponnahda'. Älä tee välilihan leikkausta ensihoito-olosuhteissa",
        "Lapsi syntyy yleensä kasvot alaspäin, ja pään synnyttyä lapsi kääntyy kasvot sivulle päin",
        "Tarkista napanuora kaulan ympäriltä: löysä → pujota pään yli; tiukka → älä revi, auta lapsi syntymään hallitusti ja vapauta nuora heti syntymän jälkeen",
        "Pään synnyttyä syntyvät hartiat, usein seuraavalla supistuksella. Elleivät itsestään: auta ensin ylempää hartiaa vetämällä supistuksen aikana rauhallisesti alas ja ulos, sitten alempaa rauhallisesti ylös ja ulos",
        "Ota lapsen kainaloista etusormilla kiinni selän puolelta – vartalo syntyy kevyesti vetämällä. Älä käytä voimaa: ulosautto on rauhallinen ja aaltomainen. Ota kunnolla kiinni, vastasyntynyt on todella liukas!",
      ]},
      { t: "⚠️ Poikkeavat ulosauttotilanteet", items: [
        "HARTIADYSTOKIA (pää syntynyt, hartiat eivät): hälytä lisäapu ja konsultoi · synnyttäjän jalat voimakkaaseen koukistukseen ja loitonnukseen ('polvet korviin', McRoberts) · paina häpyluun yläpuolelta suprapubisesti · ÄLÄ paina kohdun pohjasta",
        "PERÄTILA: älä vedä lasta äläkä koske ennen kuin se on syntynyt napaan/lapaluiden tasolle · anna synnyttäjän ponnistaa · konttausasento voi auttaa painovoimalla · jos pää ei synny spontaanisti, toimi vain koulutuksen ja konsultaation mukaan",
        "NAPANUORAN ESIINLUISKAHDUS: hätätilanne → kiireellinen kuljetus + ennakkoilmoitus · äiti polvi-rinta-/konttausasentoon tai lantio koholle · vähennä tarjoutuvan osan painetta nuoraan · pidä nuora lämpimänä ja kosteana, vältä käsittelyä",
      ]},
      { t: "5. Syntymän jälkeen: vastasyntyneen hoito", ord: true, items: [
        "Kirjaa syntymäaika kellosta",
        "Kuivaa huolellisesti ja stimuloi niin, että lapsi alkaa itkeä",
        "Pidä lämpimänä: kuivat pyyhkeet, pipo, peitto, ihokontakti – peittele äiti ja lapsi",
        "Kerro sukupuoli tai anna vanhempien tarkastaa se; anna vauva vanhemman rinnalle",
        "Varmista, että napanuoran verenvirtaus on esteetön, ja anna sen sykkiä tyhjäksi",
        "Laske Apgar-pisteet 1 ja 5 (tarvittaessa 10) minuutin iässä",
        "Napanuoran katkaisulla ei ole kiire – sen voi tehdä myös vasta sairaalassa. Ennen katkaisua napanuora klipsataan kahdesta kohtaa",
        "Tavoitevitaalit: syke yli 100/min · hengitystaajuus yli 30/min · itkee, jäntevä, punakka iho. Raajojen sinerrys voi olla aluksi normaalia – keskivartalon sinisyys, velttous tai hengittämättömyys EI ole",
      ]},
      { t: "⚠️ Huonokuntoinen vastasyntynyt (veltto, ei hengitä, kalpea/sininen)", ord: true, items: [
        "Estä lämmönhukka välittömästi",
        "Avaa hengitystie neutraaliin asentoon",
        "Kuivaa ja stimuloi (esim. hiero selkää pyyhkeellä); ime vain jos runsaat eritteet estävät ventiloinnin, näkökontrollissa",
        "Jos hengitys puutteellista tai syke alle 100/min → maskiventilaatio taajuudella 30–60/min; vähintään 32-viikkoisella aloitus huoneilmalla, happi titraten. Varmista rintakehän nousu",
        "Arvioi vaste ja syke 30 sekunnin välein: syke 60–100 → jatka tehokasta ventilointia",
        "Syke alle 60/min tehokkaasta ventilaatiosta huolimatta → paineluelvytys suhteella 3:1 ja lisäapu/lääkäriyksikkö",
        "SpO₂-tavoitteet syntymän jälkeen suuntaa-antavasti: 2 min ~65 % · 5 min ~85 % · 10 min ~90 %",
      ]},
      { t: "5. Syntymän jälkeen: synnyttäjän hoito (jälkeisvaihe)", items: [
        "Vauvan synnyttyä kuljetus nopeasti sairaalaan – jälkeisvaihe on äidille usein uhkaavin vaihe kentällä",
        "Edistä kohdun supistumista hieromalla tai painamalla sitä kohdun päältä kohti synnytyskanavaa",
        "Anna vauvan hamuta/imeä rintaa, jos molemmat voivat hyvin – tukee kohdun supistumista",
        "Tarkkaile vointia ja vuotoa: normaali vuoto alle ~500 ml. HUOM: vuoto voi kertyä kohtuun ja näkyä ulos vähäisenä – pehmeä/kookas kohtu ja sokin merkit ratkaisevat",
        "Avaa viimeistään nyt suoniyhteys (runsaassa vuodossa kaksi); sokin hoito hoito-ohjeen mukaan",
        "Oksitosiini ja runsaassa vuodossa traneksaamihappo hoito-ohjeen/konsultaation mukaan",
        "Istukka syntyy yleensä itsestään 5–30 (jopa 60) minuutin kuluessa; merkit: verihulahdus, napanuoran pidentyminen, jälkisupistukset",
        "Jos matka sairaalaan on yli 30 min, pohdi istukan ulosauttoa: ota napanuorasta kiinni ja paina kohdun pohjasta, katso seuraako istukka. Älä vedä väkisin – jos ei irtoa helposti, lopeta ja kuljeta/konsultoi",
        "Pakkaa syntynyt istukka puhtaaseen muovipussiin ja toimita synnyttäjän mukana sairaalaan tarkistettavaksi",
      ]},
      { t: "Ennakkoilmoituksessa kerro", items: [
        "Ikä ja raskausviikot · G/P, aiemmat nopeat synnytykset/sektiot",
        "Supistukset, ponnistustarve, näkyykö tarjoutuva osa",
        "Lapsivesi (aika ja väri) · vuoto (määrä, hyytymät) · kivun luonne",
        "Sikiön liikkeet, tiedossa oleva tarjonta ja istukan paikka",
        "Äidin vitaalit, sokin/neurologiset löydökset · riskit (ennenaikaisuus, monisikiö, perätila, napanuora, pre-eklampsia, trauma)",
        "Tehdyt toimet ja lääkkeet · jos lapsi syntynyt: syntymäaika, Apgar, hengitys/syke/lämpö · arvioitu saapumisaika",
      ]},
    ],
    assess: ["Synnytyksen vaihe: ehtiikö sairaalaan?", "Äidin yleisilme: puhekyky supistuksen aikana, sokin merkit suhteessa näkyvään vuotoon", "Kohtu: koko suhteessa viikkoihin, supistusten tiheys/kesto, pehmeä vai jatkuvasti pinkeä", "Vastasyntyneen arvio APGAR (1 ja 5 min, 0–2 p/kohta): Appearance (väri) · Pulse (syke) · Grimace (ärtyvyysvaste) · Activity (jäntevyys) · Respiration (hengitys)"],
    red: ["Ponnistuspakko, tarjoutuva osa näkyy, supistukset alle 5 min välein tai uudelleensynnyttäjä tiheillä supistuksilla → synnytys lähellä", "Napanuoran esiinluiskahdus, perätila/poikkitila, vihreä lapsivesi, ennenaikaisuus (< 37 vk)", "Jatkuva kova kipu + pinkeä kova kohtu + vuoto (± sokki vähäisellä ulkoisella vuodolla) → istukan irtoaminen", "Kivuton kirkas runsas vuoto → etisistukka: ÄLÄ tee sisätutkimusta", "Kova kipu joka äkisti helpottaa → sokki: kohdun repeämä (riski: aiempi sektio)", "Kouristelu, kova päänsärky, näköhäiriöt, ylävatsakipu → eklampsia", "Hartiadystokia → McRoberts + suprapubinen paine, EI kohdun pohjasta painamista"],
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
