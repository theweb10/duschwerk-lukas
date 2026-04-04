/**
 * Rule Engine — Regelbasierte Konfigurationslogik
 *
 * Verantwortlich für:
 * 1. Dynamische Filterung verfügbarer Optionen basierend auf aktuellem State
 * 2. Validierung der gesamten Konfiguration
 * 3. Automatische Korrektur bei ungültigen Kombinationen
 */

import {
  SERIEN,
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

/**
 * Gibt alle verfügbaren Einbausituationen für eine Serie zurück.
 */
export function getVerfuegbareEinbausituationen(serieId) {
  if (!serieId) return EINBAUSITUATIONEN;
  return EINBAUSITUATIONEN.filter(e => e.kompatibleSerien.includes(serieId));
}

/**
 * Gibt alle verfügbaren Türsysteme für Einbausituation + Serie zurück.
 */
export function getVerfuegbareTuersysteme(einbausituationId, serieId) {
  const einbau = EINBAUSITUATIONEN.find(e => e.id === einbausituationId);
  if (!einbau) return TUERSYSTEME;

  // Walk-In hat keine Tür
  if (einbau.kompatibleTuersysteme.length === 0) return [];

  const serie = SERIEN.find(s => s.id === serieId);
  const serieRahmen = serie ? serie.rahmentypen : [];

  return TUERSYSTEME.filter(t => {
    // Muss zur Einbausituation passen
    const nameMatch = einbau.kompatibleTuersysteme.includes(t.name);
    if (!nameMatch) return false;

    // Muss mindestens einen kompatiblen Rahmentyp mit der Serie teilen
    if (serieRahmen.length > 0) {
      const hatKompatibelRahmen = t.kompatibleRahmentypen.some(r => serieRahmen.includes(r));
      if (!hatKompatibelRahmen) return false;
    }

    return true;
  });
}

/**
 * Gibt verfügbare Glastypen für Serie + Türsystem zurück.
 */
export function getVerfuegbareGlastypen(serieId, tuersystemId) {
  const serie = SERIEN.find(s => s.id === serieId);
  if (!serie) return GLASTYPEN;

  return GLASTYPEN.filter(g => {
    // Muss in der Serie verfügbar sein
    if (!serie.glasOptionen.includes(g.name)) return false;

    // Strukturglas nicht bei Schiebetüren
    if (g.einschraenkungen?.nichtKompatibel?.includes(tuersystemId)) return false;

    return true;
  });
}

/**
 * Gibt verfügbare Glasstärken für Serie + Höhe zurück.
 */
export function getVerfuegbareGlasstaerken(serieId, hoehe) {
  const serie = SERIEN.find(s => s.id === serieId);
  if (!serie) return GLASSTAERKEN;

  let verfuegbar = GLASSTAERKEN.filter(gs => serie.glasStaerken.includes(gs.id));

  // Sicherheitsregel: Bei Höhe > 180cm mindestens 10mm
  if (hoehe > SICHERHEITSREGELN.minStaerkeBeiHoehe.schwelle) {
    const minDicke = parseInt(SICHERHEITSREGELN.minStaerkeBeiHoehe.minStaerke);
    verfuegbar = verfuegbar.filter(gs => gs.dicke >= minDicke);
  }

  return verfuegbar;
}

/**
 * Gibt verfügbare Profilfarben für eine Serie zurück.
 */
export function getVerfuegbareProfilfarben(serieId) {
  const serie = SERIEN.find(s => s.id === serieId);
  if (!serie) return PROFILFARBEN;
  return PROFILFARBEN.filter(p => serie.profilFarben.includes(p.name));
}

/**
 * Gibt verfügbare Rahmentypen für Serie + Türsystem zurück.
 */
export function getVerfuegbareRahmentypen(serieId, tuersystemId) {
  const serie = SERIEN.find(s => s.id === serieId);
  const tuer = TUERSYSTEME.find(t => t.id === tuersystemId);

  let rahmen = RAHMENTYPEN;

  if (serie) {
    rahmen = rahmen.filter(r => serie.rahmentypen.includes(r.id));
  }
  if (tuer) {
    rahmen = rahmen.filter(r => tuer.kompatibleRahmentypen.includes(r.id));
  }

  return rahmen;
}

/**
 * Gibt die Maß-Constraints für die Einbausituation + Türsystem zurück.
 */
export function getMassConstraints(einbausituationId, tuersystemId) {
  // Basis-Constraints aus Einbausituation
  let constraints;
  if (einbausituationId === 'badewanne') {
    constraints = { ...MASS_CONSTRAINTS.badewanne };
  } else if (einbausituationId === 'walkin') {
    constraints = { ...MASS_CONSTRAINTS.walkin };
  } else {
    constraints = { ...MASS_CONSTRAINTS.standard };
  }

  // Türsystem kann Breite weiter einschränken
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

/**
 * Validiert die gesamte Konfiguration und gibt Fehler zurück.
 * @returns {{ valid: boolean, errors: Array<{ field: string, message: string }> }}
 */
export function validateConfig(config) {
  const errors = [];

  // 1. Serie muss existieren
  const serie = SERIEN.find(s => s.id === config.serie);
  if (!serie) {
    errors.push({ field: 'serie', message: 'Bitte wählen Sie eine Serie.' });
    return { valid: false, errors };
  }

  // 2. Einbausituation muss zur Serie passen
  const einbau = EINBAUSITUATIONEN.find(e => e.id === config.einbausituation);
  if (!einbau) {
    errors.push({ field: 'einbausituation', message: 'Bitte wählen Sie eine Einbausituation.' });
  } else if (!einbau.kompatibleSerien.includes(config.serie)) {
    errors.push({ field: 'einbausituation', message: `${einbau.name} ist nicht verfügbar für ${serie.name}.` });
  }

  // 3. Türsystem (nur wenn Einbau eine Tür hat)
  if (einbau && einbau.kompatibleTuersysteme.length > 0) {
    if (!config.tuersystem) {
      errors.push({ field: 'tuersystem', message: 'Bitte wählen Sie ein Türsystem.' });
    } else {
      const tuer = TUERSYSTEME.find(t => t.id === config.tuersystem);
      if (!tuer) {
        errors.push({ field: 'tuersystem', message: 'Ungültiges Türsystem.' });
      } else if (!einbau.kompatibleTuersysteme.includes(tuer.name)) {
        errors.push({ field: 'tuersystem', message: `${tuer.name} ist nicht verfügbar für ${einbau.name}.` });
      }
    }
  }

  // 4. Maße
  const constraints = getMassConstraints(config.einbausituation, config.tuersystem);
  if (config.breite < constraints.breite.min || config.breite > constraints.breite.max) {
    errors.push({ field: 'breite', message: `Breite muss zwischen ${constraints.breite.min} und ${constraints.breite.max} cm liegen.` });
  }
  if (config.hoehe < constraints.hoehe.min || config.hoehe > constraints.hoehe.max) {
    errors.push({ field: 'hoehe', message: `Höhe muss zwischen ${constraints.hoehe.min} und ${constraints.hoehe.max} cm liegen.` });
  }

  // 5. Glastyp muss zur Serie + Türsystem passen
  if (config.glastyp) {
    const verfuegbareGlaeser = getVerfuegbareGlastypen(config.serie, config.tuersystem);
    if (!verfuegbareGlaeser.find(g => g.id === config.glastyp)) {
      errors.push({ field: 'glastyp', message: 'Dieser Glastyp ist für die gewählte Konfiguration nicht verfügbar.' });
    }
  }

  // 6. Glasstärke — Sicherheitsregel
  if (config.glasstaerke) {
    const verfuegbareStaerken = getVerfuegbareGlasstaerken(config.serie, config.hoehe);
    if (!verfuegbareStaerken.find(gs => gs.id === config.glasstaerke)) {
      errors.push({ field: 'glasstaerke', message: 'Diese Glasstärke ist für die gewählte Konfiguration nicht verfügbar.' });
    }
  }

  // 7. Profilfarbe muss zur Serie passen
  if (config.profilfarbe) {
    const verfuegbareProfile = getVerfuegbareProfilfarben(config.serie);
    if (!verfuegbareProfile.find(p => p.id === config.profilfarbe)) {
      errors.push({ field: 'profilfarbe', message: 'Diese Profilfarbe ist für die gewählte Serie nicht verfügbar.' });
    }
  }

  return { valid: errors.length === 0, errors };
}

// ─── Auto-Korrektur ─────────────────────────────────────────

/**
 * Korrigiert ungültige Werte automatisch auf den nächsten gültigen Wert.
 * Wird aufgerufen wenn sich eine übergeordnete Auswahl ändert.
 *
 * @returns {Object} Korrigierter Config + Array von Änderungen
 */
export function autoCorrect(config) {
  const corrected = { ...config };
  const changes = [];

  // Einbausituation prüfen
  if (corrected.einbausituation) {
    const verfuegbar = getVerfuegbareEinbausituationen(corrected.serie);
    if (!verfuegbar.find(e => e.id === corrected.einbausituation)) {
      corrected.einbausituation = verfuegbar[0]?.id || null;
      changes.push({ field: 'einbausituation', reason: 'Nicht kompatibel mit gewählter Serie' });
    }
  }

  // Türsystem prüfen
  if (corrected.einbausituation) {
    const verfuegbareTueren = getVerfuegbareTuersysteme(corrected.einbausituation, corrected.serie);
    if (verfuegbareTueren.length === 0) {
      // Walk-In → kein Türsystem
      if (corrected.tuersystem) {
        corrected.tuersystem = null;
        changes.push({ field: 'tuersystem', reason: 'Walk-In hat kein Türsystem' });
      }
    } else if (corrected.tuersystem && !verfuegbareTueren.find(t => t.id === corrected.tuersystem)) {
      corrected.tuersystem = verfuegbareTueren[0]?.id || null;
      changes.push({ field: 'tuersystem', reason: 'Nicht kompatibel mit Einbausituation/Serie' });
    }
  }

  // Maße anpassen
  const constraints = getMassConstraints(corrected.einbausituation, corrected.tuersystem);
  if (corrected.breite < constraints.breite.min) {
    corrected.breite = constraints.breite.min;
    changes.push({ field: 'breite', reason: `Minimum ${constraints.breite.min} cm` });
  } else if (corrected.breite > constraints.breite.max) {
    corrected.breite = constraints.breite.max;
    changes.push({ field: 'breite', reason: `Maximum ${constraints.breite.max} cm` });
  }
  if (corrected.hoehe < constraints.hoehe.min) {
    corrected.hoehe = constraints.hoehe.min;
    changes.push({ field: 'hoehe', reason: `Minimum ${constraints.hoehe.min} cm` });
  } else if (corrected.hoehe > constraints.hoehe.max) {
    corrected.hoehe = constraints.hoehe.max;
    changes.push({ field: 'hoehe', reason: `Maximum ${constraints.hoehe.max} cm` });
  }

  // Glastyp prüfen
  if (corrected.glastyp) {
    const verfuegbar = getVerfuegbareGlastypen(corrected.serie, corrected.tuersystem);
    if (!verfuegbar.find(g => g.id === corrected.glastyp)) {
      corrected.glastyp = verfuegbar[0]?.id || 'klarglas';
      changes.push({ field: 'glastyp', reason: 'Nicht kompatibel mit Serie/Türsystem' });
    }
  }

  // Glasstärke — Sicherheitsregel
  if (corrected.glasstaerke) {
    const verfuegbar = getVerfuegbareGlasstaerken(corrected.serie, corrected.hoehe);
    if (!verfuegbar.find(gs => gs.id === corrected.glasstaerke)) {
      corrected.glasstaerke = verfuegbar[verfuegbar.length - 1]?.id || '8mm';
      changes.push({ field: 'glasstaerke', reason: 'Sicherheitsanforderung bei gewählter Höhe' });
    }
  }

  // Profilfarbe prüfen
  if (corrected.profilfarbe) {
    const verfuegbar = getVerfuegbareProfilfarben(corrected.serie);
    if (!verfuegbar.find(p => p.id === corrected.profilfarbe)) {
      corrected.profilfarbe = verfuegbar[0]?.id || 'chrom';
      changes.push({ field: 'profilfarbe', reason: 'Nicht verfügbar für gewählte Serie' });
    }
  }

  return { config: corrected, changes };
}

// ─── Hilfsfunktion: Ist ein Schritt vollständig? ────────────

export function isStepComplete(step, config) {
  switch (step) {
    case 0: return true; // Einstieg
    case 1: return !!config.serie;
    case 2: return !!config.einbausituation;
    case 3: return config.breite > 0 && config.hoehe > 0;
    case 4: {
      const einbau = EINBAUSITUATIONEN.find(e => e.id === config.einbausituation);
      const brauchtTuer = einbau && einbau.kompatibleTuersysteme.length > 0;
      const tuerOk = !brauchtTuer || !!config.tuersystem;
      return tuerOk && !!config.glastyp && !!config.glasstaerke && !!config.profilfarbe;
    }
    case 5: return true; // Zusammenfassung
    default: return false;
  }
}

// ─── Zusammenfassung generieren ─────────────────────────────

export function generateSummary(config) {
  const serie = SERIEN.find(s => s.id === config.serie);
  const einbau = EINBAUSITUATIONEN.find(e => e.id === config.einbausituation);
  const tuer = TUERSYSTEME.find(t => t.id === config.tuersystem);
  const glas = GLASTYPEN.find(g => g.id === config.glastyp);
  const staerke = GLASSTAERKEN.find(gs => gs.id === config.glasstaerke);
  const profil = PROFILFARBEN.find(p => p.id === config.profilfarbe);
  const rahmen = RAHMENTYPEN.find(r => r.id === config.rahmentyp);

  return {
    serie: serie?.name || '—',
    einbausituation: einbau?.name || '—',
    tuersystem: tuer?.name || 'Kein Türsystem (Walk-In)',
    glastyp: glas?.name || '—',
    glasstaerke: staerke?.name || '—',
    profilfarbe: profil?.name || '—',
    rahmentyp: rahmen?.name || '—',
    breite: `${config.breite} cm`,
    hoehe: `${config.hoehe} cm`,
    beschichtung: serie?.beschichtung ? 'Ja (pflegeleicht)' : 'Nein',
  };
}
