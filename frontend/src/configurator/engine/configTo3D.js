/**
 * Bridge: Konfigurator-State → 3D-Rendering-Daten
 *
 * Übersetzt die neue Konfigurationsstruktur in das Format,
 * das ShowerCanvas / ShowerModel erwartet.
 *
 * Wenn noch keine vollständige Auswahl getroffen wurde,
 * zeigt die 3D-Vorschau ein neutrales Showcase-Modell.
 */

import { GLASTYPEN, PROFILFARBEN, GLASSTAERKEN } from '../data/productCatalog';

// Showcase-Defaults: Walk-in, Klarglas, Chrom, 90×200 cm
const SHOWCASE_DEFAULT = {
  typ:     'Walk-in',
  glas:    'Klarglas',
  staerke: '8mm',
  profil:  'Chrom poliert',
  breite:  90,
  hoehe:   200,
  extras:  [],
};

export function configTo3D(wizardConfig) {
  // Vor Serie-Auswahl: Showcase-Modell zeigen
  if (!wizardConfig.serie) return SHOWCASE_DEFAULT;

  const glas   = GLASTYPEN.find(g => g.id === wizardConfig.glastyp);
  const profil = PROFILFARBEN.find(p => p.id === wizardConfig.profilfarbe);
  const staerke = GLASSTAERKEN.find(gs => gs.id === wizardConfig.glasstaerke);

  const typ = mapToLegacyTyp(wizardConfig);

  return {
    typ,
    glas:    glas?.name    || 'Klarglas',
    staerke: staerke?.id   || '8mm',
    profil:  profil?.name  || 'Chrom poliert',
    breite:  wizardConfig.breite || 90,
    hoehe:   wizardConfig.hoehe  || 200,
    extras:  [],
  };
}

function mapToLegacyTyp({ einbausituation, tuersystem }) {
  if (einbausituation === 'walkin')    return 'Walk-in';
  if (einbausituation === 'badewanne') return 'Nische';
  return mapTuersystem(tuersystem);
}

function mapTuersystem(id) {
  switch (id) {
    case 'schiebe': return 'Schiebetür';
    case 'dreh':    return 'Drehtür';
    case 'pendel':  return 'Drehtür';
    case 'falt':    return 'Schiebetür';
    default:        return 'Walk-in';
  }
}
