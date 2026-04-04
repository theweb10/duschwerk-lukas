/**
 * Duka Duschkabinen — Vollständiger Produktkatalog
 *
 * Hierarchie: Serie → Einbausituation → Türsystem → Glas → Profil → Maße
 * Jede Ebene filtert die nächste. Nur technisch valide Kombinationen sind erlaubt.
 */

// ─── Serien ──────────────────────────────────────────────────
export const SERIEN = [
  {
    id: '5000',
    name: '5000-Serie',
    label: 'Premium',
    description: 'Rahmenlos, minimalistisches Design, maximale Glasfläche',
    preisklasse: 'premium',
    rahmentypen: ['rahmenlos'],
    glasOptionen: ['Klarglas', 'Satinato', 'Parsol Bronze', 'Parsol Grau', 'Strukturglas'],
    glasStaerken: ['8mm', '10mm'],
    profilFarben: ['Chrom poliert', 'Edelstahl gebürstet', 'Schwarz matt', 'Gold gebürstet', 'Kupfer matt'],
    beschichtung: true,
  },
  {
    id: '4000',
    name: '4000-Serie',
    label: 'Komfort',
    description: 'Teilgerahmt, elegantes Design mit hoher Stabilität',
    preisklasse: 'komfort',
    rahmentypen: ['rahmenlos', 'teilgerahmt'],
    glasOptionen: ['Klarglas', 'Satinato', 'Parsol Bronze', 'Parsol Grau'],
    glasStaerken: ['6mm', '8mm', '10mm'],
    profilFarben: ['Chrom poliert', 'Edelstahl gebürstet', 'Schwarz matt'],
    beschichtung: true,
  },
  {
    id: '3000',
    name: '3000-Serie',
    label: 'Klassik',
    description: 'Vollgerahmt, robust und bewährt',
    preisklasse: 'klassik',
    rahmentypen: ['teilgerahmt', 'vollgerahmt'],
    glasOptionen: ['Klarglas', 'Satinato', 'Parsol Grau'],
    glasStaerken: ['6mm', '8mm'],
    profilFarben: ['Chrom poliert', 'Edelstahl gebürstet', 'Schwarz matt'],
    beschichtung: false,
  },
  {
    id: '2000',
    name: '2000-Serie',
    label: 'Basis',
    description: 'Funktional, gutes Preis-Leistungs-Verhältnis',
    preisklasse: 'basis',
    rahmentypen: ['vollgerahmt'],
    glasOptionen: ['Klarglas', 'Satinato'],
    glasStaerken: ['6mm'],
    profilFarben: ['Chrom poliert', 'Edelstahl gebürstet'],
    beschichtung: false,
  },
  {
    id: 'walkin',
    name: 'Walk-In Lösungen',
    label: 'Walk-In',
    description: 'Offener Einstieg, barrierefreies Design',
    preisklasse: 'premium',
    rahmentypen: ['rahmenlos', 'teilgerahmt'],
    glasOptionen: ['Klarglas', 'Satinato', 'Parsol Bronze', 'Parsol Grau'],
    glasStaerken: ['8mm', '10mm'],
    profilFarben: ['Chrom poliert', 'Edelstahl gebürstet', 'Schwarz matt', 'Gold gebürstet'],
    beschichtung: true,
  },
  {
    id: 'badewanne',
    name: 'Badewannenlösungen',
    label: 'Badewanne',
    description: 'Aufsätze und Duschwände für Badewannen',
    preisklasse: 'komfort',
    rahmentypen: ['rahmenlos', 'teilgerahmt'],
    glasOptionen: ['Klarglas', 'Satinato', 'Parsol Grau'],
    glasStaerken: ['6mm', '8mm'],
    profilFarben: ['Chrom poliert', 'Edelstahl gebürstet', 'Schwarz matt'],
    beschichtung: true,
  },
];

// ─── Einbausituationen ───────────────────────────────────────
export const EINBAUSITUATIONEN = [
  {
    id: 'ecke',
    name: 'Eckdusche',
    description: 'Zwei Wände bilden die Ecke, Glas schließt vorne ab',
    icon: 'corner',
    kompatibleSerien: ['5000', '4000', '3000', '2000'],
    kompatibleTuersysteme: ['Pendeltür', 'Schiebetür', 'Falttür', 'Drehtür'],
  },
  {
    id: 'nische',
    name: 'Nischendusche',
    description: 'Drei Wände, Glas nur vorne',
    icon: 'niche',
    kompatibleSerien: ['5000', '4000', '3000', '2000'],
    kompatibleTuersysteme: ['Pendeltür', 'Schiebetür', 'Falttür', 'Drehtür'],
  },
  {
    id: 'walkin',
    name: 'Walk-In',
    description: 'Offener Einstieg ohne Tür',
    icon: 'walkin',
    kompatibleSerien: ['5000', '4000', 'walkin'],
    kompatibleTuersysteme: [], // Walk-In hat keine Tür
  },
  {
    id: 'badewanne',
    name: 'Badewannenaufsatz',
    description: 'Duschwand auf der Badewanne montiert',
    icon: 'bathtub',
    kompatibleSerien: ['4000', '3000', 'badewanne'],
    kompatibleTuersysteme: ['Pendeltür', 'Falttür'],
  },
  {
    id: 'sonder',
    name: 'Sonderlösung',
    description: 'Dachschräge, unregelmäßige Wände, Sonderformen',
    icon: 'special',
    kompatibleSerien: ['5000', '4000'],
    kompatibleTuersysteme: ['Pendeltür', 'Schiebetür', 'Drehtür'],
  },
];

// ─── Türsysteme ──────────────────────────────────────────────
export const TUERSYSTEME = [
  {
    id: 'pendel',
    name: 'Pendeltür',
    description: 'Öffnet nach innen und außen',
    minBreite: 60,
    maxBreite: 120,
    kompatibleRahmentypen: ['rahmenlos', 'teilgerahmt', 'vollgerahmt'],
  },
  {
    id: 'schiebe',
    name: 'Schiebetür',
    description: 'Gleitet seitlich auf Schiene',
    minBreite: 80,
    maxBreite: 200,
    kompatibleRahmentypen: ['teilgerahmt', 'vollgerahmt'],
  },
  {
    id: 'falt',
    name: 'Falttür',
    description: 'Faltet sich platzsparend zusammen',
    minBreite: 70,
    maxBreite: 140,
    kompatibleRahmentypen: ['teilgerahmt', 'vollgerahmt'],
  },
  {
    id: 'dreh',
    name: 'Drehtür',
    description: 'Klassische Öffnung nach außen',
    minBreite: 60,
    maxBreite: 100,
    kompatibleRahmentypen: ['rahmenlos', 'teilgerahmt', 'vollgerahmt'],
  },
];

// ─── Glastypen ───────────────────────────────────────────────
export const GLASTYPEN = [
  {
    id: 'klarglas',
    name: 'Klarglas',
    description: 'Transparent, maximale Lichtdurchlässigkeit',
    render: { color: '#ffffff', roughness: 0.0, transmission: 0.95, glasTyp: 'klarglas' },
  },
  {
    id: 'satinato',
    name: 'Satinato',
    description: 'Mattiert, Sichtschutz mit Lichtdurchlass',
    render: { color: '#e8eaf0', roughness: 0.8, transmission: 0.5, glasTyp: 'satinato' },
  },
  {
    id: 'parsol_bronze',
    name: 'Parsol Bronze',
    description: 'Getönt in warmem Bronze',
    render: { color: '#CD7F32', roughness: 0.05, transmission: 0.75, glasTyp: 'parsol_bronze' },
  },
  {
    id: 'parsol_grau',
    name: 'Parsol Grau',
    description: 'Getönt in elegantem Grau',
    render: { color: '#808080', roughness: 0.05, transmission: 0.75, glasTyp: 'parsol_grau' },
  },
  {
    id: 'strukturglas',
    name: 'Strukturglas',
    description: 'Strukturierte Oberfläche für besonderen Effekt',
    render: { color: '#f0f0f0', roughness: 0.15, transmission: 0.6, glasTyp: 'strukturglas' },
    einschraenkungen: { nichtKompatibel: ['schiebe'] },
  },
];

// ─── Profilfarben ────────────────────────────────────────────
export const PROFILFARBEN = [
  { id: 'chrom',      name: 'Chrom poliert',       swatch: '#E8E8E8', render: { color: '#E8E8E8', metalness: 0.95, roughness: 0.03, metalTyp: 'poliert' } },
  { id: 'edelstahl',  name: 'Edelstahl gebürstet', swatch: '#AAAAAA', render: { color: '#AAAAAA', metalness: 0.90, roughness: 0.22, metalTyp: 'gebürstet' } },
  { id: 'schwarz',    name: 'Schwarz matt',        swatch: '#222222', render: { color: '#222222', metalness: 0.70, roughness: 0.45, metalTyp: 'matt' } },
  { id: 'gold',       name: 'Gold gebürstet',      swatch: '#C5A55A', render: { color: '#C5A55A', metalness: 0.90, roughness: 0.18, metalTyp: 'gold' } },
  { id: 'kupfer',     name: 'Kupfer matt',         swatch: '#B87333', render: { color: '#B87333', metalness: 0.85, roughness: 0.30, metalTyp: 'kupfer' } },
];

// ─── Glasstärken ─────────────────────────────────────────────
export const GLASSTAERKEN = [
  { id: '6mm',  name: '6 mm',  dicke: 6,  render3d: 0.04 },
  { id: '8mm',  name: '8 mm',  dicke: 8,  render3d: 0.06 },
  { id: '10mm', name: '10 mm', dicke: 10, render3d: 0.08 },
];

// ─── Rahmentypen ─────────────────────────────────────────────
export const RAHMENTYPEN = [
  { id: 'rahmenlos',    name: 'Rahmenlos',     description: 'Minimalistisch, Glas pur' },
  { id: 'teilgerahmt',  name: 'Teilgerahmt',   description: 'Profile oben und an den Seiten' },
  { id: 'vollgerahmt',  name: 'Vollgerahmt',   description: 'Kompletter Rahmen rundum' },
];

// ─── Montagearten ────────────────────────────────────────────
export const MONTAGEARTEN = [
  { id: 'wand',        name: 'Wandmontage' },
  { id: 'ecke',        name: 'Eckeinbau' },
  { id: 'freistehend', name: 'Freistehend' },
  { id: 'badewanne',   name: 'Badewannenintegration' },
];

// ─── Maß-Constraints ────────────────────────────────────────
export const MASS_CONSTRAINTS = {
  standard: {
    breite: { min: 60, max: 200, step: 1 },
    hoehe:  { min: 180, max: 220, step: 1 },
  },
  badewanne: {
    breite: { min: 60, max: 160, step: 1 },
    hoehe:  { min: 120, max: 160, step: 1 },
  },
  walkin: {
    breite: { min: 80, max: 200, step: 1 },
    hoehe:  { min: 190, max: 220, step: 1 },
  },
};

// ─── Sicherheitsregel ────────────────────────────────────────
// Bei Höhe > 180cm muss Glasstärke >= 10mm sein (Statik/Sicherheit)
export const SICHERHEITSREGELN = {
  minStaerkeBeiHoehe: { schwelle: 180, minStaerke: '10mm' },
};
