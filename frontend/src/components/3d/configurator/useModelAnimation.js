import { useRef } from 'react';

/**
 * Erweiterte Modell-Animation mit:
 * - Crossfade (Typ-Wechsel): Scale out → Scale in
 * - Material-Morph: Sanftes Überblenden bei Glaswechsel
 * - Pulse: Subtile Bestätigung bei kleinen Änderungen
 * - Smooth entry: Initiales Einblenden
 */
export function useModelAnimation() {
  const animScale   = useRef(0.0);   // Start bei 0 für Entry-Animation
  const animOpacity = useRef(0.0);
  const phase       = useRef('entry'); // 'entry' | 'idle' | 'out' | 'in' | 'pulse' | 'morph'
  const phaseStart  = useRef(performance.now());

  function triggerTransition(type = 'crossfade') {
    switch (type) {
      case 'pulse':
        phase.current = 'pulse';
        phaseStart.current = performance.now();
        break;
      case 'morph':
        // Sanftes Material-Überblenden (kein Scale-Change)
        phase.current = 'morph';
        phaseStart.current = performance.now();
        break;
      default:
        // Crossfade: Scale down → up
        phase.current = 'out';
        phaseStart.current = performance.now();
    }
  }

  function tickAnimation() {
    const now     = performance.now();
    const elapsed = now - phaseStart.current;

    switch (phase.current) {
      case 'entry': {
        // Smooth entry: 800ms ease-out
        const p = Math.min(elapsed / 800, 1);
        const ease = 1 - Math.pow(1 - p, 3); // easeOutCubic
        animScale.current   = 0.85 + 0.15 * ease;
        animOpacity.current = ease;
        if (p >= 1) {
          phase.current = 'idle';
          animScale.current = 1.0;
          animOpacity.current = 1.0;
        }
        break;
      }
      case 'out': {
        const p = Math.min(elapsed / 180, 1);
        const ease = p * p; // easeInQuad
        animScale.current   = 1.0 - 0.06 * ease;
        animOpacity.current = 1.0 - ease;
        if (p >= 1) {
          phase.current      = 'in';
          phaseStart.current = now;
        }
        break;
      }
      case 'in': {
        const p = Math.min(elapsed / 350, 1);
        const ease = 1 - Math.pow(1 - p, 3); // easeOutCubic — smooth Rückkehr
        animScale.current   = 0.94 + 0.06 * ease;
        animOpacity.current = ease;
        if (p >= 1) {
          phase.current       = 'idle';
          animScale.current   = 1.0;
          animOpacity.current = 1.0;
        }
        break;
      }
      case 'morph': {
        // Kurzes Opacity-Dip → Rückkehr (Material-Überblendung)
        const p = Math.min(elapsed / 400, 1);
        const dip = Math.sin(p * Math.PI); // 0→1→0 Kurve
        animOpacity.current = 1.0 - dip * 0.15; // Leichter Opacity-Dip
        animScale.current   = 1.0;
        if (p >= 1) {
          phase.current       = 'idle';
          animOpacity.current = 1.0;
        }
        break;
      }
      case 'pulse': {
        const p = Math.min(elapsed / 350, 1);
        const ease = Math.sin(p * Math.PI); // smooth pulse
        animScale.current   = 1.0 + 0.015 * ease;
        animOpacity.current = 1.0;
        if (p >= 1) {
          phase.current     = 'idle';
          animScale.current = 1.0;
        }
        break;
      }
      // idle: nichts tun
    }
  }

  return { animScale, animOpacity, triggerTransition, tickAnimation };
}
