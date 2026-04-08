/**
 * Bridge: Konfigurator-State → 3D-Rendering-Daten
 *
 * Übergibt Render-Objekte direkt statt Name-Strings,
 * damit alle Farben und Materialien korrekt im 3D-Modell erscheinen.
 */

import { GLASTYPEN, PROFILFARBEN, GLASSTAERKEN } from '../data/productCatalog';

const DEFAULT_GLASS = { color: '#ffffff', roughness: 0.02, transmission: 0.98, glasTyp: 'klarglas' };
const DEFAULT_METAL = { color: '#E8E8E8', metalness: 0.95, roughness: 0.03, metalTyp: 'poliert' };

const SHOWCASE_DEFAULT = {
  typ:     'Walk-in',
  glass:   DEFAULT_GLASS,
  staerke: '8mm',
  metal:   DEFAULT_METAL,
  breite:  90,
  hoehe:   200,
};

export function configTo3D(wizardConfig) {
  if (!wizardConfig.einbausituation) return SHOWCASE_DEFAULT;

  const glas    = GLASTYPEN.find(g => g.id === wizardConfig.glastyp);
  const profil  = PROFILFARBEN.find(p => p.id === wizardConfig.profilfarbe);
  const staerke = GLASSTAERKEN.find(gs => gs.id === wizardConfig.glasstaerke);

  const typ = mapToLegacyTyp(wizardConfig);

  return {
    typ,
    glass:   glas?.render   || DEFAULT_GLASS,
    metal:   profil?.render  || DEFAULT_METAL,
    staerke: staerke?.id     || '8mm',
    breite:  wizardConfig.breite || 90,
    hoehe:   wizardConfig.hoehe  || 200,
  };
}

function mapToLegacyTyp({ einbausituation, tuersystem }) {
  if (einbausituation === 'walkin')    return 'Walk-in';
  if (einbausituation === 'glaswand')  return 'Walk-in';
  if (einbausituation === 'badewanne') return 'Nische';
  return mapTuersystem(tuersystem);
}

function mapTuersystem(id) {
  switch (id) {
    case 'schiebe': return 'Schiebetür';
    case 'schwenk': return 'Drehtür';
    case 'pendel':  return 'Drehtür';
    case 'falt':    return 'Schiebetür';
    default:        return 'Walk-in';
  }
}
