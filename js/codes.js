// Ensihoidon tehtäväkoodit (lähde: EH-Info / ehinfo.fi)
// Ryhmitelty johtovastuun ja tehtäväluokan mukaan.

export const CODE_GROUPS = [
  {
    id: "eh",
    label: "Ensihoito (7-alkuiset)",
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
          ["X-0", "Tekninen este"],
          ["X-1", "Kuollut"],
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

// Edistyneet / huomionarvoiset toimenpiteet ja tilanteet, joita voi merkitä keikkaan.
// EI perusasioita (EKG, i.v.-yhteys, monitorointi, vitaalit, auskultaatio, happihoito).
// Lähteet: ensihoito-online.fi, ehinfo.fi, Duodecim (ks. README).
export const PROCEDURES = [
  // Ilmatie & hengitys
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
