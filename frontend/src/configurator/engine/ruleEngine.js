/**
 * Rule Engine — Regelbasierte Konfigurationslogik
 *
 * Verantwortlich für:
 * 1. Dynamische Filterung verfügbarer Optionen basierend auf aktuellem State
 * 2. Validierung der gesamten Konfiguration
 * 3. Automatische Korrektur bei ungültigen Kombinationen
 *
 * Vereinfacht: Kein "Serie"-Konzept mehr – direkt Einbausituation → Türart → Bauart → Maße → Design
 */

import {
  EINBAUSITUATIONEN,
  TUERSYSTEME,
  GLASTYPEN,
  PROFILFARBEN,
  GLASSTAERKEN,
  RAHMENTYPEN,
  MASS_CONSTRAINTS,
  SICHERHEITSREGELN,
} from '../data/productCatalog';

// ─── Verfügbare Optionen berechnen ──────────────────────────

export function getVerfuegbareEinbausituationen() {
  return EINBAUSITUATIONEN;
}

export function getVerfuegbareTuersysteme(einbausituationId) {
  const einbau = EINBAUSITUATIONEN.find(e => e.id === einbausituationId);
  if (!einbau) return TUERSYSTEME;
  if (einbau.kompatibleTuersysteme.length === 0) return [];
  return TUERSYSTEME.filter(t => einbau.kompatibleTuersysteme.includes(t.name));
}

export function getVerfuegbareRahmentypen(tuersystemId) {
  const tuer = TUERSYSTEME.find(t => t.id === tuersystemId);
  if (!tuer) return RAHMENTYPEN;
  return RAHMENTYPEN.filter(r => tuer.kompatibleRahmentypen.includes(r.id));
}

export function getVerfuegbareGlastypen(tuersystemId) {
  return GLASTYPEN.filter(g => {
    if (g.einschraenkungen?.nichtKompatibel?.includes(tuersystemId)) return false;
    return true;
  });
}

export function getVerfuegbareGlasstaerken(hoehe) {
  if (hoehe > SICHERHEITSREGELN.minStaerkeBeiHoehe.schwelle) {
    const minDicke = parseInt(SICHERHEITSREGELN.minStaerkeBeiHoehe.minStaerke);
    return GLASSTAERKEN.filter(gs => gs.dicke >= minDicke);
  }
  return GLASSTAERKEN;
}

export function getVerfuegbareProfilfarben() {
  return PROFILFARBEN;
}

// Legacy: wird noch von useConfiguratorState referenziert
export function getVerfuegbareEinbausituationenBySerie() {
  return EINBAUSITUATIONEN;
}

export function getMassConstraints(einbausituationId, tuersystemId) {
  let constraints;
  if (einbausituationId === 'badewanne') {
    constraints = { ...MASS_CONSTRAINTS.badewanne };
  } else if (einbausituationId === 'walkin') {
    constraints = { ...MASS_CONSTRAINTS.walkin };
  } else {
    constraints = { ...MASS_CONSTRAINTS.standard };
  }

  const tuer = TUERSYSTEME.find(t => t.id === tuersystemId);
  if (tuer) {
    constraints.breite = {
      ...constraints.breite,
      min: Math.max(constraints.breite.min, tuer.minBreite),
      max: Math.min(constraints.breite.max, tuer.maxBreite),
    };
  }

  return {
    breite: { ...constraints.breite },
    hoehe: { ...constraints.hoehe },
  };
}

// ─── Validierung ────────────────────────────────────────────

export function validateConfig(config) {
  const errors = [];

  const einbau = EINBAUSITUATIONEN.find(e => e.id === config.einbausituation);
  if (!einbau) {
    errors.push({ field: 'einbausituation', message: 'Bitte wählen Sie eine Einbausituation.' });
    return { valid: false, errors };
  }

  if (einbau.kompatibleTuersysteme.length > 0 && !config.tuersystem) {
    errors.push({ field: 'tuersystem', message: 'Bitte wählen Sie eine Türart.' });
  }

  if (!config.rahmentyp) {
    errors.push({ field: 'rahmentyp', message: 'Bitte wählen Sie eine Bauart.' });
  }

  const constraints = getMassConstraints(config.einbausituation, config.tuersystem);
  if (config.breite < constraints.breite.min || config.breite > constraints.breite.max) {
    errors.push({ field: 'breite', message: `Breite: ${constraints.breite.min}–${constraints.breite.max} cm` });
  }
  if (config.hoehe < constraints.hoehe.min || config.hoehe > constraints.hoehe.max) {
    errors.push({ field: 'hoehe', message: `Höhe: ${constraints.hoehe.min}–${constraints.hoehe.max} cm` });
  }

  if (!config.glastyp) {
    errors.push({ field: 'glastyp', message: 'Bitte wählen Sie einen Glastyp.' });
  } else {
    const verfuegbar = getVerfuegbareGlastypen(config.tuersystem);
    if (!verfuegbar.find(g => g.id === config.glastyp)) {
      errors.push({ field: 'glastyp', message: 'Dieser Glastyp ist nicht verfügbar.' });
    }
  }

  if (!config.profilfarbe) {
    errors.push({ field: 'profilfarbe', message: 'Bitte wählen Sie eine Profilfarbe.' });
  }

  return { valid: errors.length === 0, errors };
}

// ─── Auto-Korrektur ─────────────────────────────────────────

export function autoCorrect(config) {
  const corrected = { ...config };
  const changes = [];

  if (corrected.einbausituation) {
    const verfuegbareTueren = getVerfuegbareTuersysteme(corrected.einbausituation);
    if (verfuegbareTueren.length === 0) {
      if (corrected.tuersystem) {
        corrected.tuersystem = null;
        changes.push({ field: 'tuersystem', reason: 'Kein Türsystem für diese Einbausituation' });
      }
    } else if (corrected.tuersystem && !verfuegbareTueren.find(t => t.id === corrected.tuersystem)) {
      corrected.tuersystem = verfuegbareTueren[0]?.id || null;
      changes.push({ field: 'tuersystem', reason: 'Türart angepasst' });
    }
  }

  if (corrected.rahmentyp) {
    const verfuegbar = getVerfuegbareRahmentypen(corrected.tuersystem);
    if (!verfuegbar.find(r => r.id === corrected.rahmentyp)) {
      corrected.rahmentyp = verfuegbar[0]?.id || null;
      changes.push({ field: 'rahmentyp', reason: 'Bauart angepasst' });
    }
  }

  const constraints = getMassConstraints(corrected.einbausituation, corrected.tuersystem);
  if (corrected.breite < constraints.breite.min) {
    corrected.breite = constraints.breite.min;
    changes.push({ field: 'breite', reason: `Mindestbreite ${constraints.breite.min} cm` });
  } else if (corrected.breite > constraints.breite.max) {
    corrected.breite = constraints.breite.max;
    changes.push({ field: 'breite', reason: `Maximalbreite ${constraints.breite.max} cm` });
  }
  if (corrected.hoehe < constraints.hoehe.min) {
    corrected.hoehe = constraints.hoehe.min;
    changes.push({ field: 'hoehe', reason: `Mindesthöhe ${constraints.hoehe.min} cm` });
  } else if (corrected.hoehe > constraints.hoehe.max) {
    corrected.hoehe = constraints.hoehe.max;
    changes.push({ field: 'hoehe', reason: `Maximalhöhe ${constraints.hoehe.max} cm` });
  }

  if (corrected.glastyp) {
    const verfuegbar = getVerfuegbareGlastypen(corrected.tuersystem);
    if (!verfuegbar.find(g => g.id === corrected.glastyp)) {
      corrected.glastyp = verfuegbar[0]?.id || 'klarglas';
      changes.push({ field: 'glastyp', reason: 'Glastyp angepasst' });
    }
  }

  return { config: corrected, changes };
}

// ─── Schritt vollständig? ────────────────────────────────────

export function isStepComplete(step, config) {
  switch (step) {
    case 0: return true; // Einstieg
    case 1: return !!config.einbausituation;
    case 2: {
      const einbau = EINBAUSITUATIONEN.find(e => e.id === config.einbausituation);
      if (!einbau) return false;
      if (einbau.kompatibleTuersysteme.length === 0) return true;
      return !!config.tuersystem;
    }
    case 3: return !!config.rahmentyp;
    case 4: return config.breite > 0 && config.hoehe > 0;
    case 5: return !!config.glastyp && !!config.profilfarbe;
    case 6: return true; // Zusammenfassung
    default: return false;
  }
}

// ─── Zusammenfassung generieren ─────────────────────────────

export function generateSummary(config) {
  const einbau  = EINBAUSITUATIONEN.find(e => e.id === config.einbausituation);
  const tuer    = TUERSYSTEME.find(t => t.id === config.tuersystem);
  const rahmen  = RAHMENTYPEN.find(r => r.id === config.rahmentyp);
  const glas    = GLASTYPEN.find(g => g.id === config.glastyp);
  const staerke = GLASSTAERKEN.find(gs => gs.id === config.glasstaerke);
  const profil  = PROFILFARBEN.find(p => p.id === config.profilfarbe);

  return {
    einbausituation: einbau?.name  || '—',
    tuersystem:      tuer?.name    || 'Kein Türsystem (Walk-In)',
    rahmentyp:       rahmen?.name  || '—',
    glastyp:         glas?.name    || '—',
    profilfarbe:     profil?.name  || '—',
    breite:          `${config.breite} cm`,
    tiefe:           config.einbausituation === 'ecke' ? `${config.tiefe} cm` : null,
    hoehe:           `${config.hoehe} cm`,
  };
}
