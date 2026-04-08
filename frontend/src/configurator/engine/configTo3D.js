/**
 * Bridge: Konfigurator-State → 3D-Rendering-Daten
 */
import { GLASTYPEN, PROFILFARBEN, GLASSTAERKEN } from '../data/productCatalog';

const DEFAULT_GLASS = { color: '#f6f9ff', roughness: 0.015, transmission: 0.97, glasTyp: 'klarglas' };
const DEFAULT_METAL = { color: '#E8E8E8', metalness: 0.95, roughness: 0.03, metalTyp: 'poliert' };

const SHOWCASE_DEFAULT = {
  typ:       'Drehtür',
  glass:     DEFAULT_GLASS,
  staerke:   '8mm',
  metal:     DEFAULT_METAL,
  breite:    90,
  hoehe:     200,
  rahmentyp: 'teilgerahmt',
};

export function configTo3D(wizardConfig) {
  if (!wizardConfig.einbausituation) return SHOWCASE_DEFAULT;

  const glas    = GLASTYPEN.find(g => g.id === wizardConfig.glastyp);
  const profil  = PROFILFARBEN.find(p => p.id === wizardConfig.profilfarbe);
  const staerke = GLASSTAERKEN.find(gs => gs.id === wizardConfig.glasstaerke);

  const typ = mapToTyp(wizardConfig);

  return {
    typ,
    glass:     glas?.render    || DEFAULT_GLASS,
    metal:     profil?.render  || DEFAULT_METAL,
    staerke:   staerke?.id     || '8mm',
    breite:    wizardConfig.breite    || 90,
    hoehe:     wizardConfig.hoehe     || 200,
    rahmentyp: wizardConfig.rahmentyp || 'teilgerahmt',
  };
}

function mapToTyp({ einbausituation, tuersystem }) {
  if (einbausituation === 'walkin')    return 'Walk-in';
  if (einbausituation === 'glaswand')  return 'Walk-in';
  if (einbausituation === 'badewanne') return 'Schiebetür';
  return mapTuersystem(tuersystem);
}

function mapTuersystem(id) {
  switch (id) {
    case 'drehtuer': return 'Drehtür';
    case 'schiebe':  return 'Schiebetür';
    case 'falt':     return 'Falttür';
    default:         return 'Drehtür';
  }
}
