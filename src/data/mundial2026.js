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
// Partidos de EJEMPLO para la pestana Predicciones. locksAt se calcula
// relativo a "ahora" para que el contador corra como en la referencia.
// ─────────────────────────────────────────────────────────────────────────
const hours = (h) => new Date(Date.now() + h * 3600 * 1000);

export const FIXTURES = [
  // En vivo
  {
    id: "m1",
    group: "A",
    round: "Fase de grupos · J1",
    home: "MEX",
    away: "RSA",
    dateLabel: "Inauguración",
    time: "18:00",
    status: "live",
    minute: 63,
    homeScore: 2,
    awayScore: 1,
    myPred: { h: 2, a: 0 },
  },
  {
    id: "m2",
    group: "J",
    round: "Fase de grupos · J1",
    home: "ARG",
    away: "ALG",
    dateLabel: "Hoy",
    time: "20:00",
    status: "live",
    minute: 27,
    homeScore: 1,
    awayScore: 0,
    myPred: { h: 3, a: 0 },
  },
  // Proximos (con contador de bloqueo)
  {
    id: "m3",
    group: "K",
    round: "Fase de grupos · J1",
    home: "COL",
    away: "UZB",
    dateLabel: "Vie 12 jun",
    time: "16:00",
    status: "upcoming",
    locksAt: hours(26),
    myPred: null,
    featured: true,
  },
  {
    id: "m4",
    group: "H",
    round: "Fase de grupos · J1",
    home: "ESP",
    away: "CPV",
    dateLabel: "Vie 12 jun",
    time: "19:00",
    status: "upcoming",
    locksAt: hours(29),
    myPred: { h: 3, a: 0 },
  },
  {
    id: "m5",
    group: "C",
    round: "Fase de grupos · J1",
    home: "BRA",
    away: "MAR",
    dateLabel: "Sáb 13 jun",
    time: "15:00",
    status: "upcoming",
    locksAt: hours(49),
    myPred: null,
  },
  {
    id: "m6",
    group: "K",
    round: "Fase de grupos · J1",
    home: "POR",
    away: "COD",
    dateLabel: "Sáb 13 jun",
    time: "18:00",
    status: "upcoming",
    locksAt: hours(52),
    myPred: null,
  },
  {
    id: "m7",
    group: "I",
    round: "Fase de grupos · J1",
    home: "FRA",
    away: "SEN",
    dateLabel: "Dom 14 jun",
    time: "14:00",
    status: "upcoming",
    locksAt: hours(72),
    myPred: null,
  },
  {
    id: "m8",
    group: "L",
    round: "Fase de grupos · J1",
    home: "ENG",
    away: "CRO",
    dateLabel: "Dom 14 jun",
    time: "17:00",
    status: "upcoming",
    locksAt: hours(75),
    myPred: null,
  },
  // Finalizados (con puntos ganados)
  {
    id: "m9",
    group: "D",
    round: "Fase de grupos · J1",
    home: "USA",
    away: "PAR",
    dateLabel: "Ayer",
    time: "20:00",
    status: "finished",
    homeScore: 1,
    awayScore: 1,
    myPred: { h: 1, a: 1 },
    earned: 3,
  },
  {
    id: "m10",
    group: "E",
    round: "Fase de grupos · J1",
    home: "GER",
    away: "CUW",
    dateLabel: "Ayer",
    time: "17:00",
    status: "finished",
    homeScore: 3,
    awayScore: 0,
    myPred: { h: 2, a: 0 },
    earned: 1,
  },
  {
    id: "m11",
    group: "B",
    round: "Fase de grupos · J1",
    home: "CAN",
    away: "BIH",
    dateLabel: "Ayer",
    time: "14:00",
    status: "finished",
    homeScore: 0,
    awayScore: 2,
    myPred: { h: 1, a: 1 },
    earned: 0,
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
