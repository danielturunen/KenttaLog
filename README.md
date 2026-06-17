# 🚑 KenttäLog

Henkilökohtainen **ensihoidon vuoro- ja keikkapäiväkirja** työharjoittelua varten.
Kirjaa vuorot ja niiden aikana tulleet hälytykset: tehtäväkoodi, hälytysaste (A–D),
lyhyt kuvaus ja kuljetuspäätös. Saat lisäksi tilastot ja sisäänrakennetun
tehtäväkoodikirjaston.

KenttäLog on **selainpohjainen sovellus (PWA)**, joka toimii puhelimella ja
tietokoneella, myös offline-tilassa, ja jonka voi asentaa kotinäytölle.
Erillistä palvelinta ei tarvita.

## Ominaisuudet

- **Vuorot** – päivä (9–21), yö (21–9) tai vapaa aikaväli, yksikkö/asema ja
  oppimispäiväkirjamerkinnät. Tukee 2 pv töissä / 2 pv vapaata -rytmiä.
- **Keikat** – kellonaika, hälytysaste A–D, haettava tehtäväkoodi (numerolla tai
  sanalla), kuvaus ja lopputulos (kuljetettu / oma kyyti / X-5 / hoidettu kohteessa…)
  sekä kuljetuskohde (Meilahti, Malmi, Naistenklinikka, ULS…).
- **Tehtäväkoodikirjasto** – ensihoidon (7-), pelastuksen (2-/4-) ja poliisin (0-)
  johtoiset koodit sekä X-koodit. Haettavissa. Lähde: [EH-Info](https://ehinfo.fi/ensihoidon-tehtavakoodit/).
- **Tilastot** – keikkoja per vuoro, kuljetusprosentti, hälytysastejakauma,
  johtovastuun jakauma, yleisimmät koodit ja kuljetuskohteet, kirjatut tunnit.
- **Haku & suodatus** kaikista keikoista.
- **Varmuuskopio** – yksi tiedosto, joka sisältää kaiken (vuorot, keikat ja asetukset kuten oletusasema/-yksikkö); vienti ja palautus.
- **Tumma teema** – silmäystävällinen erityisesti yövuoroissa.

## Käyttö

Avaa sivu selaimessa. Lisää vuoro `+ Vuoro` -napilla, avaa vuoro ja kirjaa
keikat `+ Keikka` -napilla. Puhelimessa voit asentaa sovelluksen kotinäytölle
selaimen "Lisää aloitusnäyttöön" -toiminnolla.

### Paikallinen ajo

```bash
# mikä tahansa staattinen palvelin, esim.
python3 -m http.server 8000
# avaa http://localhost:8000
```

> Service worker ja moduulit vaativat `http(s)`-osoitteen – pelkkä `file://` ei riitä.

### Julkaisu GitHub Pagesiin

Repon asetukset → **Pages** → Source: `Deploy from a branch` → valitse haaran
juuri (`/root`). Sivusto julkaistaan automaattisesti.

## 🔒 Tietosuoja

KenttäLog on **henkilökohtainen oppimispäiväkirja**. Tiedot tallentuvat vain
oman selaimesi muistiin (localStorage) – mitään ei lähetetä mihinkään.

**Älä koskaan kirjaa potilaan tunnistetietoja** (nimi, henkilötunnus, osoite,
tarkka syntymäaika). Pidä keikkakuvaukset yleisellä, opetuksellisella tasolla.
Tämä ei ole virallinen potilasasiakirja eikä korvaa työnantajan kirjaamis-
järjestelmiä.

## Tekninen toteutus

Puhdas HTML + CSS + JavaScript (ES-moduulit), ei riippuvuuksia eikä build-vaihetta.
Tiedot `localStorage`-muistissa, offline service workerilla.
