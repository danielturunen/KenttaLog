// Ensihoidon tehtäväkoodit (lähde: EH-Info / ehinfo.fi)
// Ryhmitelty johtovastuun ja tehtäväluokan mukaan.

export const CODE_GROUPS = [
  {
    id: "eh",
    label: "Ensihoidon tehtäväluokat ja -koodit",
    lead: "Ensihoito",
    color: "#1f9d57",
    categories: [
      {
        title: "Peruselintoiminnan häiriö",
        codes: [
          ["700", "Eloton"],
          ["701", "Elvytys"],
          ["702", "Tajuttomuus"],
          ["703", "Hengitysvaikeus"],
          ["704", "Rintakipu"],
          ["705", "Rytmihäiriö"],
          ["706", "Aivoverenkiertohäiriö"],
          ["707", "Ensihoitopalveluun kuuluva hoitolaitossiirto"],
        ],
      },
      {
        title: "Hapenpuute",
        codes: [
          ["711", "Ilmatie-este"],
          ["713", "Hirttäytyminen, kuristuminen"],
          ["714", "Hukkuminen"],
        ],
      },
      {
        title: "Vamma (muu mekaaninen)",
        codes: [
          ["741", "Putoaminen"],
          ["744", "Haava"],
          ["745", "Kaatuminen"],
          ["746", "Isku"],
          ["747", "Puristuminen / muu vamma"],
        ],
      },
      {
        title: "Onnettomuus (ei mekaaninen)",
        codes: [
          ["751", "Kaasumyrkytys"],
          ["752", "Myrkytys"],
          ["753", "Sähköisku"],
          ["754", "Palovamma"],
          ["755", "Ylilämpöisyys"],
          ["756", "Paleltuminen, alilämpöisyys"],
        ],
      },
      {
        title: "Verenvuoto (ilman vammaa)",
        codes: [
          ["761", "Suusta"],
          ["762", "Gynekologinen / urologinen"],
          ["763", "Korva / nenä"],
          ["764", "Sääri / muu"],
        ],
      },
      {
        title: "Sairaus (liittyy löydös)",
        codes: [
          ["770", "Epäselvä sairauskohtaus"],
          ["771", "Sokeritasapainon häiriö"],
          ["772", "Kouristelu"],
          ["773", "Yliherkkyysreaktio"],
          ["774", "Muu sairastuminen"],
          ["775", "Oksentelu / ripuli / virtsavaiva"],
        ],
      },
      {
        title: "Sairaus (ilmenee oireena)",
        codes: [
          ["781", "Vatsakipu"],
          ["782", "Pää- / niskakipu"],
          ["783", "Selkä- / lonkkakipu"],
          ["784", "Raajakipu"],
          ["785", "Mielenterveysongelma"],
          ["786", "Vartalokipu"],
        ],
      },
      {
        title: "Sairaankuljetustehtävä",
        codes: [
          ["790", "Hälytys puhelun aikana"],
          ["791", "Synnytys"],
          ["792", "Varallaolo, valmiussiirto"],
          ["793", "Hoitolaitossiirto"],
          ["794", "Muu sairaankuljetus- / aikatilaustehtävä"],
          ["796", "Monipotilastilanne / suuronnettomuus"],
        ],
      },
    ],
  },
  {
    id: "x",
    label: "X-koodit (ei kuljetusta)",
    lead: "Ensihoito",
    color: "#8a8f98",
    categories: [
      {
        title: "X, ei kuljetusta",
        codes: [
          ["X-0", "Tehtävän suorittaminen estyy"],
          ["X-1", "Potilas kuollut"],
          ["X-2", "Terveydentila määritelty, ohjattu poliisin suojaan"],
          ["X-3", "Pyydetty kohteeseen muuta apua"],
          ["X-4", "Muu kuljetus"],
          ["X-5", "Terveydentila määritelty, ei tarvetta ensihoidolle"],
          ["X-6", "Potilas kieltäytyy"],
          ["X-7", "Potilasta ei löydy"],
          ["X-8", "Potilas hoidettu kohteessa"],
          ["X-9", "Tehtävän peruutus"],
        ],
      },
    ],
  },
  {
    id: "pel",
    label: "Pelastusjohtoiset (2- ja 4-alkuiset)",
    lead: "Pelastus",
    color: "#e0563b",
    categories: [
      {
        title: "Tieliikenneonnettomuus",
        codes: [
          ["200", "Muu tai onnettomuuden uhka"],
          ["202", "Pieni"],
          ["203", "Keskisuuri"],
          ["204", "Suuri"],
          ["206", "Maan alla, pieni"],
          ["207", "Maan alla, keskisuuri"],
          ["208", "Maan alla, suuri"],
        ],
      },
      {
        title: "Raideliikenneonnettomuus",
        codes: [
          ["210", "Muu"],
          ["212", "Pieni"],
          ["213", "Keskisuuri"],
          ["214", "Suuri"],
          ["216", "Maan alla, pieni"],
          ["217", "Maan alla, keskisuuri"],
          ["218", "Maan alla, suuri"],
        ],
      },
      {
        title: "Vesi- ja ilmaliikenne, maasto",
        codes: [
          ["222", "Vesiliikenneonnettomuus, keskisuuri"],
          ["223", "Vesiliikenneonnettomuus, suuri"],
          ["231", "Ilmaliikenne onnettomuus: pieni"],
          ["232", "Ilmaliikenne onnettomuus: keskisuuri"],
          ["233", "Ilmaliikenne onnettomuus: suuri"],
          ["234", "Ilmaliikenne vaara: pieni"],
          ["235", "Ilmaliikenne vaara: keskisuuri"],
          ["236", "Ilmaliikenne vaara: suuri"],
          ["271", "Maastoliikenneonnettomuus"],
        ],
      },
      {
        title: "Rakennus- ja välinepalo",
        codes: [
          ["401", "Rakennuspalo: pieni"],
          ["402", "Rakennuspalo: keskisuuri"],
          ["403", "Rakennuspalo: suuri"],
          ["411", "Liikennevälinepalo: pieni"],
          ["412", "Liikennevälinepalo: keskisuuri"],
          ["413", "Liikennevälinepalo: suuri"],
        ],
      },
      {
        title: "Räjähdys, sortuma, vaarallinen aine",
        codes: [
          ["441", "Räjähdys tai sortuma: pieni"],
          ["442", "Räjähdys tai sortuma: keskisuuri"],
          ["443", "Räjähdys tai sortuma: suuri"],
          ["444", "Räjähdys- tai sortumavaara"],
          ["451", "Vaarallisen aineen onnettomuus: pieni"],
          ["452", "Vaarallisen aineen onnettomuus: keskisuuri"],
          ["453", "Vaarallisen aineen onnettomuus: suuri"],
        ],
      },
      {
        title: "Ihmisen pelastaminen ja muu onnettomuus",
        codes: [
          ["480", "Ihmisen pelastaminen: muu"],
          ["483", "Ihmisen pelastaminen vedestä"],
          ["486", "Ihmisen pelastaminen puristuksista"],
          ["487", "Ihmisen pelastaminen ylhäältä tai alhaalta"],
          ["492", "Onnettomuus maan alla: keskisuuri"],
          ["493", "Onnettomuus maan alla: suuri"],
        ],
      },
    ],
  },
  {
    id: "pol",
    label: "Poliisijohtoiset (0-alkuiset)",
    lead: "Poliisi",
    color: "#2b6cd4",
    categories: [
      {
        title: "Pahoinpitely, tappelu",
        codes: [
          ["031", "Ampuminen"],
          ["032", "Puukotus"],
          ["033", "Potkiminen, hakkaaminen"],
          ["034", "Tekotapa epäselvä"],
        ],
      },
    ],
  },
];

// Litistetty hakurakenne: koodi -> { code, name, group, lead, category, color }
export const CODE_MAP = (() => {
  const map = new Map();
  for (const g of CODE_GROUPS) {
    for (const c of g.categories) {
      for (const [code, name] of c.codes) {
        map.set(code, {
          code,
          name,
          group: g.label,
          groupId: g.id,
          lead: g.lead,
          category: c.title,
          color: g.color,
        });
      }
    }
  }
  return map;
})();

export const ALL_CODES = [...CODE_MAP.values()];

export function lookupCode(code) {
  return CODE_MAP.get(code) || null;
}

// Hälytysasteet
export const URGENCY = {
  A: { label: "A", desc: "Korkein riski – välitön hengenvaara", color: "#d6332e" },
  B: { label: "B", desc: "Todennäköisesti korkeariskinen", color: "#e07a1f" },
  C: { label: "C", desc: "Peruselintoiminnot vakaat, tarkistettava", color: "#e0b21f" },
  D: { label: "D", desc: "Kiireetön", color: "#2f9e44" },
};

// X-koodien tarkenteet (alakoodit). Lähde: EH-Info (ehinfo.fi).
export const X_SUBCODES = {
  "X-0": [
    ["X-01", "Tekninen este"],
    ["X-02", "Henkilöstön työajan ylitys"],
    ["X-03", "Tehtävä hoidettu maayksiköllä"],
    ["X-04", "Sääeste"],
    ["X-05", "Ei helikopteria käytettävissä"],
    ["X-06", "Ei helikopterille soveltuvaa laskeutumispaikkaa"],
  ],
  "X-1": [
    ["X-11", "Potilas kuollut, ei aktiivisia hoitotoimenpiteitä"],
    ["X-12", "Potilas kuollut, aktiiviset hoitotoimenpiteet"],
  ],
  "X-2": [
    ["X-21", "Potilas siirtyy poliisin valvontaan"],
  ],
  "X-3": [
    ["X-31", "Pyydetty kohteeseen muuta apua"],
  ],
  "X-4": [
    ["X-41", "Kuljetus toisella ensihoitoyksiköllä"],
    ["X-42", "Kuljetus toisella ensihoitoyksiköllä, kenttäjohtaja tai ensihoitaja saattaa"],
    ["X-43", "Kuljetus toisella ensihoitoyksiköllä, ensihoitolääkäri saattaa"],
    ["X-44", "Ohjataan jatkohoitoon muulla kuljetuksella"],
  ],
  "X-5": [
    ["X-51", "Ei tarvetta ensihoitoon tai hoitotoimenpiteisiin"],
    ["X-52", "Etäyhteydellä tehdyn hoidontarpeen arvion perusteella ei tarvetta ensihoitoon tai hoitotoimenpiteisiin"],
  ],
  "X-6": [
    ["X-61", "Potilas kieltäytyi terveydentilan arvioinnista tai hoidosta"],
    ["X-62", "Potilas kieltäytyi jatkohoitoon kuljettamisesta"],
  ],
  "X-7": [
    ["X-71", "Ei potilasta"],
  ],
  "X-8": [
    ["X-81", "Potilas hoidettu kohteessa, hoito-ohje pyydetty tai hoidettu pysyväisohjeen mukaan"],
  ],
  "X-9": [
    ["X-91", "Peruutus hätäkeskuksen lisätiedon perusteella"],
    ["X-92", "Peruutus muun lisätiedon perusteella"],
    ["X-93", "Peruutus kohteessa olevan yksikön toimesta"],
    ["X-94", "Peruutus tilannekeskuksen / kenttäjohtajan / ensihoitolääkärin toimesta"],
  ],
};

// Tarkenne (esim. "X-41") -> kuvaus.
export const X_SUB_MAP = (() => {
  const m = new Map();
  for (const subs of Object.values(X_SUBCODES)) for (const [code, name] of subs) m.set(code, name);
  return m;
})();

// Edistyneet / huomionarvoiset toimenpiteet ja tilanteet, joita voi merkitä keikkaan.
// EI perusasioita (EKG, i.v.-yhteys, monitorointi, vitaalit, auskultaatio, happihoito).
// Lähteet: ensihoito-online.fi, ehinfo.fi, Duodecim (ks. README).
export const PROCEDURES = [
  // Ilmatie & hengitys
  "Maskiventilaatio",
  "Intubaatio",
  "Supraglottinen ilmatie (i-gel)",
  "Krikotyreotomia (hätäilmatie)",
  "Neulatorakosenteesi",
  "CPAP",
  "NIV (non-invasiivinen ventilaatio)",
  // Verenkierto & elvytys
  "Elvytys",
  "Mekaaninen paineluelvytin (LUCAS)",
  "Kardioversio",
  "Transkutaaninen tahdistus",
  "Luuydinyhteys (i.o.)",
  "Vasoaktiivinen lääkeinfuusio",
  "Elvytyksen lopetus / kuolleen toteaminen",
  // Trauma
  "PTT-trauma",
  "Kiristysside (tourniquet)",
  "Painepakkaus / hemostaattinen sidos",
  "Lantion tukivyö",
  "Vetolasta",
  "Murtuman / nivelen reponointi",
  // Lääkkeellinen & muu
  "Lääkeavusteinen rauhoittaminen",
  "Liuotushoito (trombolyysi)",
  "Hätäverensiirto",
  // Operatiivinen
  "Synnytys",
  "Monipotilastilanne",
  "Hätäsiirto",
];
