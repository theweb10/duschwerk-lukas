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
    id: 'nische',
    name: 'Nischenlösung',
    description: 'Dusche zwischen zwei Wänden',
    icon: 'niche',
    kompatibleSerien: ['5000', '4000', '3000', '2000'],
    kompatibleTuersysteme: ['Drehtür', 'Schiebetür', 'Falttür'],
  },
  {
    id: 'ecke',
    name: 'Eckdusche',
    description: 'Dusche mit zwei Glaswänden',
    icon: 'corner',
    kompatibleSerien: ['5000', '4000', '3000', '2000'],
    kompatibleTuersysteme: ['Drehtür', 'Schiebetür', 'Falttür'],
  },
  {
    id: 'walkin',
    name: 'Walk-In Dusche',
    description: 'Offene Dusche mit festem Glasteil',
    icon: 'walkin',
    kompatibleSerien: ['5000', '4000', 'walkin'],
    kompatibleTuersysteme: [], // Walk-In hat keine Tür
  },
  {
    id: 'badewanne',
    name: 'Badewannenaufsatz',
    description: 'Duschabtrennung auf bestehender Badewanne',
    icon: 'bathtub',
    kompatibleSerien: ['4000', '3000', 'badewanne'],
    kompatibleTuersysteme: ['Drehtür', 'Falttür'],
  },
];

// ─── Türsysteme ──────────────────────────────────────────────
export const TUERSYSTEME = [
  {
    id: 'drehtuer',
    name: 'Drehtür',
    description: 'Klassische Öffnung nach außen',
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
    id: 'ultraclear',
    name: 'UltraClear Glas',
    description: 'Besonders klares, eisenreduziertes Glas',
    render: { color: '#f8fffc', roughness: 0.0, transmission: 0.98, glasTyp: 'klarglas' },
  },
  {
    id: 'grauglas',
    name: 'Grauglas',
    description: 'Getönt in elegantem Grau',
    render: { color: '#808080', roughness: 0.05, transmission: 0.75, glasTyp: 'parsol_grau' },
  },
  {
    id: 'graphitglas',
    name: 'Graphitglas',
    description: 'Dunkle, anthrazitfarbene Tönung',
    render: { color: '#444444', roughness: 0.05, transmission: 0.60, glasTyp: 'parsol_grau' },
  },
  {
    id: 'braunglas',
    name: 'Braunglas',
    description: 'Warme Bronzetönung',
    render: { color: '#CD7F32', roughness: 0.05, transmission: 0.70, glasTyp: 'parsol_bronze' },
  },
  {
    id: 'spiegelglas',
    name: 'Spiegelglas',
    description: 'Spiegelnde Oberfläche (modellabhängig)',
    render: { color: '#ccddee', roughness: 0.02, transmission: 0.30, glasTyp: 'satinato' },
    einschraenkungen: { nichtKompatibel: ['schiebe'] },
  },
];

// ─── Profilfarben ────────────────────────────────────────────
// Artweger Farben
export const PROFILFARBEN_ARTWEGER = [
  { id: 'silber-matt',     name: 'Silber matt',     swatch: '#C0C0C0', render: { color: '#C0C0C0', metalness: 0.85, roughness: 0.30, metalTyp: 'gebürstet' } },
  { id: 'metall-hg',      name: 'Metall hochglanz', swatch: '#E8E8E8', render: { color: '#E8E8E8', metalness: 0.95, roughness: 0.03, metalTyp: 'poliert' } },
  { id: 'weiss',           name: 'Weiß',             swatch: '#F5F5F5', render: { color: '#F5F5F5', metalness: 0.10, roughness: 0.60, metalTyp: 'matt' } },
  { id: 'weiss-matt',      name: 'Weiß matt',        swatch: '#EEEEEE', render: { color: '#EEEEEE', metalness: 0.05, roughness: 0.80, metalTyp: 'matt' } },
  { id: 'optic-bronze',    name: 'Optic Bronze',     swatch: '#8B6C42', render: { color: '#8B6C42', metalness: 0.85, roughness: 0.25, metalTyp: 'kupfer' } },
  { id: 'optic-kupfer',    name: 'Optic Kupfer',     swatch: '#B87333', render: { color: '#B87333', metalness: 0.85, roughness: 0.30, metalTyp: 'kupfer' } },
  { id: 'optic-nickel',    name: 'Optic Nickel',     swatch: '#A8A89A', render: { color: '#A8A89A', metalness: 0.88, roughness: 0.20, metalTyp: 'gebürstet' } },
];

// Radaway Farben
export const PROFILFARBEN_RADAWAY = [
  { id: 'chrom',           name: 'Chrom',                swatch: '#E8E8E8', render: { color: '#E8E8E8', metalness: 0.95, roughness: 0.03, metalTyp: 'poliert' } },
  { id: 'schwarz',         name: 'Schwarz',               swatch: '#222222', render: { color: '#222222', metalness: 0.70, roughness: 0.45, metalTyp: 'matt' } },
  { id: 'weiss-r',         name: 'Weiß',                  swatch: '#F5F5F5', render: { color: '#F5F5F5', metalness: 0.10, roughness: 0.60, metalTyp: 'matt' } },
  { id: 'gold',            name: 'Gold',                  swatch: '#C5A55A', render: { color: '#C5A55A', metalness: 0.90, roughness: 0.18, metalTyp: 'gold' } },
  { id: 'gold-gebürstet',  name: 'Gebürstetes Gold',      swatch: '#B8973A', render: { color: '#B8973A', metalness: 0.88, roughness: 0.25, metalTyp: 'gold' } },
  { id: 'kupfer-gebürstet',name: 'Gebürstetes Kupfer',    swatch: '#A0634A', render: { color: '#A0634A', metalness: 0.85, roughness: 0.28, metalTyp: 'kupfer' } },
  { id: 'nickel-gebürstet',name: 'Gebürstetes Nickel',   swatch: '#9A9A8A', render: { color: '#9A9A8A', metalness: 0.88, roughness: 0.22, metalTyp: 'gebürstet' } },
  { id: 'gunmetal',        name: 'Gunmetal',              swatch: '#4A4A4A', render: { color: '#4A4A4A', metalness: 0.80, roughness: 0.35, metalTyp: 'matt' } },
];

// Kombiniert (für Konfigurator-Default)
export const PROFILFARBEN = [
  ...PROFILFARBEN_ARTWEGER,
  ...PROFILFARBEN_RADAWAY,
];

// ─── Glasstärken ─────────────────────────────────────────────
export const GLASSTAERKEN = [
  { id: '6mm',  name: '6 mm',  dicke: 6,  render3d: 0.04 },
  { id: '8mm',  name: '8 mm',  dicke: 8,  render3d: 0.06 },
  { id: '10mm', name: '10 mm', dicke: 10, render3d: 0.08 },
];

// ─── Rahmentypen ─────────────────────────────────────────────
export const RAHMENTYPEN = [
  { id: 'vollgerahmt',  name: 'Vollrahmen',    description: 'Kompletter Rahmen rundum' },
  { id: 'teilgerahmt',  name: 'Teilgerahmt',   description: 'Nur an der Wand ein Rahmen (modellabhängig auch zwischen den Gläsern)' },
  { id: 'rahmenlos',    name: 'Rahmenlos',     description: 'Befestigungswinkel am Glas zur Wandmontage – kein sichtbarer Rahmen (nur auf Anfrage)' },
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
