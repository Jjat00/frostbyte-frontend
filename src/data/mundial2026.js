/**
 * Datos del Mundial 2026 para la app de la Polla (MOCKUP).
 *
 * - GROUPS: sorteo REAL del Mundial 2026 (12 grupos A-L, 48 selecciones),
 *   verificado cruzando Wikipedia, FIFA.com y ESPN. Codigos ISO-2 para flagcdn.
 * - FIXTURES, RANKING, MISSIONS, MY_STATS: datos de EJEMPLO para mostrar como
 *   se vera la app en vivo. No hay logica de negocio todavia.
 *
 * Cuando exista el backend, esto se reemplaza por la respuesta de API-Football
 * (league=1, season=2026). Ver nota de fuentes de datos en el README/equipo.
 */

// Pitazo inicial del Mundial 2026
export const KICKOFF = new Date("2026-06-11T18:00:00-05:00");

// Metadatos por confederacion (para acentos de color en las tarjetas)
export const CONF_META = {
  UEFA: { label: "UEFA", color: "#3b82f6" },
  CONMEBOL: { label: "CONMEBOL", color: "#eab308" },
  CONCACAF: { label: "CONCACAF", color: "#22c55e" },
  CAF: { label: "CAF", color: "#f97316" },
  AFC: { label: "AFC", color: "#ef4444" },
  OFC: { label: "OFC", color: "#14b8a6" },
};

// ─────────────────────────────────────────────────────────────────────────
// Sorteo real del Mundial 2026 (12 grupos A-L). iso2 = codigo flagcdn.
// ─────────────────────────────────────────────────────────────────────────
export const GROUPS = [
  {
    letter: "A",
    teams: [
      { name: "México", code: "MEX", iso2: "mx", conf: "CONCACAF", host: true },
      { name: "Sudáfrica", code: "RSA", iso2: "za", conf: "CAF" },
      { name: "Corea del Sur", code: "KOR", iso2: "kr", conf: "AFC" },
      { name: "Rep. Checa", code: "CZE", iso2: "cz", conf: "UEFA" },
    ],
  },
  {
    letter: "B",
    teams: [
      { name: "Canadá", code: "CAN", iso2: "ca", conf: "CONCACAF", host: true },
      { name: "Bosnia y H.", code: "BIH", iso2: "ba", conf: "UEFA" },
      { name: "Catar", code: "QAT", iso2: "qa", conf: "AFC" },
      { name: "Suiza", code: "SUI", iso2: "ch", conf: "UEFA" },
    ],
  },
  {
    letter: "C",
    teams: [
      { name: "Brasil", code: "BRA", iso2: "br", conf: "CONMEBOL" },
      { name: "Marruecos", code: "MAR", iso2: "ma", conf: "CAF" },
      { name: "Haití", code: "HAI", iso2: "ht", conf: "CONCACAF" },
      { name: "Escocia", code: "SCO", iso2: "gb-sct", conf: "UEFA" },
    ],
  },
  {
    letter: "D",
    teams: [
      { name: "Estados Unidos", code: "USA", iso2: "us", conf: "CONCACAF", host: true },
      { name: "Paraguay", code: "PAR", iso2: "py", conf: "CONMEBOL" },
      { name: "Australia", code: "AUS", iso2: "au", conf: "AFC" },
      { name: "Turquía", code: "TUR", iso2: "tr", conf: "UEFA" },
    ],
  },
  {
    letter: "E",
    teams: [
      { name: "Alemania", code: "GER", iso2: "de", conf: "UEFA" },
      { name: "Curazao", code: "CUW", iso2: "cw", conf: "CONCACAF" },
      { name: "Costa de Marfil", code: "CIV", iso2: "ci", conf: "CAF" },
      { name: "Ecuador", code: "ECU", iso2: "ec", conf: "CONMEBOL" },
    ],
  },
  {
    letter: "F",
    teams: [
      { name: "Países Bajos", code: "NED", iso2: "nl", conf: "UEFA" },
      { name: "Japón", code: "JPN", iso2: "jp", conf: "AFC" },
      { name: "Suecia", code: "SWE", iso2: "se", conf: "UEFA" },
      { name: "Túnez", code: "TUN", iso2: "tn", conf: "CAF" },
    ],
  },
  {
    letter: "G",
    teams: [
      { name: "Bélgica", code: "BEL", iso2: "be", conf: "UEFA" },
      { name: "Egipto", code: "EGY", iso2: "eg", conf: "CAF" },
      { name: "Irán", code: "IRN", iso2: "ir", conf: "AFC" },
      { name: "Nueva Zelanda", code: "NZL", iso2: "nz", conf: "OFC" },
    ],
  },
  {
    letter: "H",
    teams: [
      { name: "España", code: "ESP", iso2: "es", conf: "UEFA" },
      { name: "Cabo Verde", code: "CPV", iso2: "cv", conf: "CAF" },
      { name: "Arabia Saudita", code: "KSA", iso2: "sa", conf: "AFC" },
      { name: "Uruguay", code: "URU", iso2: "uy", conf: "CONMEBOL" },
    ],
  },
  {
    letter: "I",
    teams: [
      { name: "Francia", code: "FRA", iso2: "fr", conf: "UEFA" },
      { name: "Senegal", code: "SEN", iso2: "sn", conf: "CAF" },
      { name: "Irak", code: "IRQ", iso2: "iq", conf: "AFC" },
      { name: "Noruega", code: "NOR", iso2: "no", conf: "UEFA" },
    ],
  },
  {
    letter: "J",
    teams: [
      { name: "Argentina", code: "ARG", iso2: "ar", conf: "CONMEBOL" },
      { name: "Argelia", code: "ALG", iso2: "dz", conf: "CAF" },
      { name: "Austria", code: "AUT", iso2: "at", conf: "UEFA" },
      { name: "Jordania", code: "JOR", iso2: "jo", conf: "AFC" },
    ],
  },
  {
    letter: "K",
    teams: [
      { name: "Portugal", code: "POR", iso2: "pt", conf: "UEFA" },
      { name: "RD Congo", code: "COD", iso2: "cd", conf: "CAF" },
      { name: "Uzbekistán", code: "UZB", iso2: "uz", conf: "AFC" },
      { name: "Colombia", code: "COL", iso2: "co", conf: "CONMEBOL" },
    ],
  },
  {
    letter: "L",
    teams: [
      { name: "Inglaterra", code: "ENG", iso2: "gb-eng", conf: "UEFA" },
      { name: "Croacia", code: "CRO", iso2: "hr", conf: "UEFA" },
      { name: "Ghana", code: "GHA", iso2: "gh", conf: "CAF" },
      { name: "Panamá", code: "PAN", iso2: "pa", conf: "CONCACAF" },
    ],
  },
];

// Registro plano de selecciones por codigo: TEAMS["COL"] = {name, iso2, conf, group}
export const TEAMS = GROUPS.reduce((acc, g) => {
  g.teams.forEach((t) => {
    acc[t.code] = { ...t, group: g.letter };
  });
  return acc;
}, {});

export const teamByCode = (code) => TEAMS[code] || { name: code, code, iso2: null };

// Forma reciente (mock determinista) para los puntitos bajo cada seleccion.
// w = victoria, d = empate, l = derrota. Rota segun el codigo del equipo.
const FORM_BASE = ["w", "w", "d", "l", "w"];
export const teamForm = (code) => {
  const shift =
    [...String(code)].reduce((s, c) => s + c.charCodeAt(0), 0) % FORM_BASE.length;
  return FORM_BASE.slice(shift).concat(FORM_BASE.slice(0, shift));
};

// ─────────────────────────────────────────────────────────────────────────
// Tabla de posiciones de EJEMPLO (vista previa de como se vera en vivo).
// Determinista: rota que equipo encabeza segun el indice del grupo.
// ─────────────────────────────────────────────────────────────────────────
const STANDING_PATTERNS = [
  { g: 2, e: 0, p: 0, gf: 5, gc: 1 }, // 6 pts
  { g: 1, e: 1, p: 0, gf: 3, gc: 2 }, // 4 pts
  { g: 0, e: 1, p: 1, gf: 1, gc: 3 }, // 1 pt
  { g: 0, e: 0, p: 2, gf: 1, gc: 4 }, // 0 pts
];

export const groupStandings = (group, groupIndex) => {
  const n = group.teams.length;
  return group.teams
    .map((_, i) => (i + groupIndex) % n)
    .map((teamIdx, rank) => {
      const t = group.teams[teamIdx];
      const pat = STANDING_PATTERNS[rank];
      return {
        ...t,
        pj: pat.g + pat.e + pat.p,
        g: pat.g,
        e: pat.e,
        p: pat.p,
        gf: pat.gf,
        gc: pat.gc,
        dg: pat.gf - pat.gc,
        pts: pat.g * 3 + pat.e,
      };
    });
};

// ─────────────────────────────────────────────────────────────────────────
// Formateo de fecha/hora en hora de Colombia (America/Bogota, UTC-5).
// kickoff se guarda en UTC y se muestra siempre en hora local de Colombia.
// ─────────────────────────────────────────────────────────────────────────
const BOGOTA = "America/Bogota";
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// "Jue 11 jun"
export const matchDayLabel = (date) => {
  const wd = new Intl.DateTimeFormat("es-CO", { timeZone: BOGOTA, weekday: "short" })
    .format(date)
    .replace(".", "");
  const d = new Intl.DateTimeFormat("es-CO", { timeZone: BOGOTA, day: "numeric" }).format(date);
  const mo = new Intl.DateTimeFormat("es-CO", { timeZone: BOGOTA, month: "short" })
    .format(date)
    .replace(".", "");
  return `${cap(wd)} ${d} ${mo}`;
};

// "14:00" (24h)
export const matchTime = (date) =>
  new Intl.DateTimeFormat("es-CO", {
    timeZone: BOGOTA,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

// Clave estable para agrupar por dia (YYYY-MM-DD en hora de Colombia)
export const matchDayKey = (date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: BOGOTA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

// ─────────────────────────────────────────────────────────────────────────
// Calendario REAL de la Jornada 1 del Mundial 2026 (24 partidos, 11-17 jun).
// Emparejamientos, sedes y horarios verificados cruzando Wikipedia, FIFA.com,
// ESPN y medios (NBC/Sky/Fox Sports). kickoff en UTC.
//
// Para mostrar los 3 estados de la UI, la app se presenta como si fuera mitad
// de la jornada: los partidos del 11 jun como finalizados, uno del 12 en vivo
// y el resto proximos. Los MARCADORES y PRONOSTICOS son de ejemplo (los
// partidos aun no se juegan); los EMPAREJAMIENTOS y horarios son reales.
// ─────────────────────────────────────────────────────────────────────────
export const FIXTURES = [
  // ── Jue 11 jun (finalizados, marcadores de ejemplo) ──
  {
    id: "m1",
    group: "A",
    home: "MEX",
    away: "RSA",
    kickoff: new Date("2026-06-11T19:00:00Z"),
    status: "finished",
    homeScore: 2,
    awayScore: 1,
    myPred: { h: 2, a: 1 },
    earned: 3,
  },
  {
    id: "m2",
    group: "A",
    home: "KOR",
    away: "CZE",
    kickoff: new Date("2026-06-12T02:00:00Z"),
    status: "finished",
    homeScore: 0,
    awayScore: 1,
    myPred: { h: 1, a: 2 },
    earned: 1,
  },
  // ── Vie 12 jun ──
  {
    id: "m3",
    group: "B",
    home: "CAN",
    away: "BIH",
    kickoff: new Date("2026-06-12T19:00:00Z"),
    status: "live",
    minute: 38,
    homeScore: 1,
    awayScore: 0,
    myPred: { h: 2, a: 0 },
  },
  {
    id: "m5",
    group: "D",
    home: "USA",
    away: "PAR",
    kickoff: new Date("2026-06-13T01:00:00Z"),
    status: "upcoming",
    myPred: { h: 2, a: 1 },
  },
  // ── Sáb 13 jun ──
  {
    id: "m4",
    group: "B",
    home: "QAT",
    away: "SUI",
    kickoff: new Date("2026-06-13T19:00:00Z"),
    status: "upcoming",
    myPred: { h: 0, a: 2 },
  },
  {
    id: "m6",
    group: "C",
    home: "BRA",
    away: "MAR",
    kickoff: new Date("2026-06-13T22:00:00Z"),
    status: "upcoming",
    myPred: { h: 3, a: 1 },
  },
  {
    id: "m7",
    group: "C",
    home: "HAI",
    away: "SCO",
    kickoff: new Date("2026-06-14T01:00:00Z"),
    status: "upcoming",
    myPred: null,
  },
  {
    id: "m8",
    group: "D",
    home: "AUS",
    away: "TUR",
    kickoff: new Date("2026-06-14T04:00:00Z"),
    status: "upcoming",
    myPred: null,
  },
  // ── Dom 14 jun ──
  {
    id: "m11",
    group: "F",
    home: "NED",
    away: "JPN",
    kickoff: new Date("2026-06-14T20:00:00Z"),
    status: "upcoming",
    myPred: null,
  },
  {
    id: "m9",
    group: "E",
    home: "GER",
    away: "CUW",
    kickoff: new Date("2026-06-14T22:00:00Z"),
    status: "upcoming",
    myPred: null,
  },
  {
    id: "m12",
    group: "F",
    home: "SWE",
    away: "TUN",
    kickoff: new Date("2026-06-15T02:00:00Z"),
    status: "upcoming",
    myPred: null,
  },
  {
    id: "m10",
    group: "E",
    home: "CIV",
    away: "ECU",
    kickoff: new Date("2026-06-15T04:00:00Z"),
    status: "upcoming",
    myPred: null,
  },
  // ── Lun 15 jun ──
  {
    id: "m15",
    group: "H",
    home: "ESP",
    away: "CPV",
    kickoff: new Date("2026-06-15T16:00:00Z"),
    status: "upcoming",
    myPred: { h: 3, a: 0 },
  },
  {
    id: "m13",
    group: "G",
    home: "BEL",
    away: "EGY",
    kickoff: new Date("2026-06-15T19:00:00Z"),
    status: "upcoming",
    myPred: null,
  },
  {
    id: "m16",
    group: "H",
    home: "KSA",
    away: "URU",
    kickoff: new Date("2026-06-15T22:00:00Z"),
    status: "upcoming",
    myPred: null,
  },
  {
    id: "m14",
    group: "G",
    home: "IRN",
    away: "NZL",
    kickoff: new Date("2026-06-16T01:00:00Z"),
    status: "upcoming",
    myPred: null,
  },
  // ── Mar 16 jun ──
  {
    id: "m17",
    group: "I",
    home: "FRA",
    away: "SEN",
    kickoff: new Date("2026-06-16T19:00:00Z"),
    status: "upcoming",
    myPred: null,
  },
  {
    id: "m18",
    group: "I",
    home: "IRQ",
    away: "NOR",
    kickoff: new Date("2026-06-16T22:00:00Z"),
    status: "upcoming",
    myPred: null,
  },
  {
    id: "m19",
    group: "J",
    home: "ARG",
    away: "ALG",
    kickoff: new Date("2026-06-17T01:00:00Z"),
    status: "upcoming",
    myPred: null,
  },
  {
    id: "m20",
    group: "J",
    home: "AUT",
    away: "JOR",
    kickoff: new Date("2026-06-17T04:00:00Z"),
    status: "upcoming",
    myPred: null,
  },
  // ── Mié 17 jun ──
  {
    id: "m21",
    group: "K",
    home: "POR",
    away: "COD",
    kickoff: new Date("2026-06-17T17:00:00Z"),
    status: "upcoming",
    myPred: null,
  },
  {
    id: "m23",
    group: "L",
    home: "ENG",
    away: "CRO",
    kickoff: new Date("2026-06-17T20:00:00Z"),
    status: "upcoming",
    myPred: null,
  },
  {
    id: "m24",
    group: "L",
    home: "GHA",
    away: "PAN",
    kickoff: new Date("2026-06-17T23:00:00Z"),
    status: "upcoming",
    myPred: null,
  },
  {
    id: "m22",
    group: "K",
    home: "UZB",
    away: "COL",
    kickoff: new Date("2026-06-18T02:00:00Z"),
    status: "upcoming",
    myPred: { h: 1, a: 2 },
    featured: true,
  },
];

export const FIXTURE_FILTERS = [
  { id: "upcoming", label: "Próximos" },
  { id: "live", label: "En vivo" },
  { id: "finished", label: "Finalizados" },
];

// ─────────────────────────────────────────────────────────────────────────
// Ranking de EJEMPLO (participantes de Frostbyte). isYou = el usuario actual.
// ─────────────────────────────────────────────────────────────────────────
export const RANKING = [
  { pos: 1, name: "Mariana Lasso", points: 83, exact: 12 },
  { pos: 2, name: "Santiago Leal", points: 78, exact: 11 },
  { pos: 3, name: "Juan D. Erazo", points: 73, exact: 9 },
  { pos: 4, name: "Valentina Ruiz", points: 68, exact: 8 },
  { pos: 5, name: "Camilo Chávez", points: 64, exact: 8 },
  { pos: 6, name: "Daniela Ortega", points: 59, exact: 7 },
  { pos: 7, name: "Tú", points: 54, exact: 6, isYou: true },
  { pos: 8, name: "Andrés Pantoja", points: 51, exact: 6 },
  { pos: 9, name: "Laura Méndez", points: 47, exact: 5 },
  { pos: 10, name: "Kevin Burbano", points: 44, exact: 5 },
  { pos: 11, name: "Sofía Narváez", points: 40, exact: 4 },
  { pos: 12, name: "Mateo Cuaical", points: 36, exact: 4 },
];

export const MY_STATS = {
  points: 54,
  position: 7,
  total: 247,
  exactHits: 6,
  correctHits: 18,
  predicted: 9,
};

// Premio (consistente con el landing: un solo campeon)
export const PRIZE = {
  champion: "$500.000",
  note: "En efectivo · un solo ganador",
};

// ─────────────────────────────────────────────────────────────────────────
// Menciones / pronosticos del torneo completo (mockup).
// Se eligen una sola vez; valen mas puntos que un partido normal.
//   type "team"   -> se elige una seleccion (campeon, subcampeon)
//   type "player" -> se elige un jugador (goleador, MVP)
//   type "keeper" -> se elige un arquero (guante de oro)
// ─────────────────────────────────────────────────────────────────────────
export const AWARDS = [
  { id: "champion", title: "Campeón", hint: "¿Quién levanta la copa?", points: 25, type: "team" },
  { id: "runnerup", title: "Subcampeón", hint: "El finalista que pierde", points: 15, type: "team" },
  { id: "scorer", title: "Goleador", hint: "Bota de Oro del torneo", points: 35, type: "player" },
  { id: "mvp", title: "MVP", hint: "Mejor jugador (Balón de Oro)", points: 10, type: "player" },
  { id: "glove", title: "Guante de Oro", hint: "Mejor arquero", points: 10, type: "keeper" },
];

// Jugadores estrella de EJEMPLO para Goleador / MVP (team = codigo de su seleccion).
export const STAR_PLAYERS = [
  { name: "Lionel Messi", team: "ARG" },
  { name: "Kylian Mbappé", team: "FRA" },
  { name: "Vinícius Jr.", team: "BRA" },
  { name: "Erling Haaland", team: "NOR" },
  { name: "Harry Kane", team: "ENG" },
  { name: "Cristiano Ronaldo", team: "POR" },
  { name: "Lamine Yamal", team: "ESP" },
  { name: "Luis Díaz", team: "COL" },
  { name: "Jude Bellingham", team: "ENG" },
  { name: "Julián Álvarez", team: "ARG" },
  { name: "Mohamed Salah", team: "EGY" },
  { name: "Florian Wirtz", team: "GER" },
];

// Arqueros de EJEMPLO para Guante de Oro.
export const STAR_KEEPERS = [
  { name: "Emiliano Martínez", team: "ARG" },
  { name: "Alisson Becker", team: "BRA" },
  { name: "Thibaut Courtois", team: "BEL" },
  { name: "Unai Simón", team: "ESP" },
  { name: "Mike Maignan", team: "FRA" },
  { name: "Camilo Vargas", team: "COL" },
  { name: "Yassine Bono", team: "MAR" },
  { name: "Jordan Pickford", team: "ENG" },
];

// ─────────────────────────────────────────────────────────────────────────
// Misiones de EJEMPLO.
// ─────────────────────────────────────────────────────────────────────────
export const MISSIONS = [
  {
    id: "first",
    title: "Tu primer pronóstico",
    desc: "Pronostica el marcador de cualquier partido.",
    reward: "+10 pts",
    progress: 1,
    total: 1,
    done: true,
  },
  {
    id: "exact3",
    title: "Ojo de halcón",
    desc: "Acierta 3 marcadores exactos.",
    reward: "+25 pts",
    progress: 2,
    total: 3,
    done: false,
  },
  {
    id: "colombia",
    title: "Mi corazón es tricolor",
    desc: "Pronostica todos los partidos de Colombia.",
    reward: "Insignia ⭐",
    progress: 1,
    total: 3,
    done: false,
  },
  {
    id: "streak5",
    title: "En racha",
    desc: "Acierta 5 resultados seguidos.",
    reward: "+40 pts",
    progress: 3,
    total: 5,
    done: false,
  },
  {
    id: "groupstage",
    title: "Maestro de grupos",
    desc: "Pronostica todos los partidos de la fase de grupos.",
    reward: "+100 pts",
    progress: 9,
    total: 72,
    done: false,
  },
  {
    id: "invite",
    title: "Trae la banda",
    desc: "Invita a un amigo a la Polla de Frostbyte.",
    reward: "Bebida gratis 🥤",
    progress: 0,
    total: 1,
    done: false,
  },
];
