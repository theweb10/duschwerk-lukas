import { useRef } from 'react';

export function useModelAnimation() {
  const animScale   = useRef(1.0);
  const animOpacity = useRef(1.0);
  const phase       = useRef('idle'); // 'idle' | 'out' | 'in' | 'pulse'
  const phaseStart  = useRef(0);

  function triggerTransition(type = 'crossfade') {
    if (type === 'pulse') {
      phase.current     = 'pulse';
      phaseStart.current = performance.now();
    } else {
      phase.current     = 'out';
      phaseStart.current = performance.now();
    }
  }

  function tickAnimation() {
    const now     = performance.now();
    const elapsed = now - phaseStart.current;

    if (phase.current === 'out') {
      const p = Math.min(elapsed / 200, 1);
      animScale.current   = 1.0 - 0.05 * p;
      animOpacity.current = 1.0 - p;
      if (p >= 1) {
        phase.current      = 'in';
        phaseStart.current = now;
      }
    } else if (phase.current === 'in') {
      const p = Math.min(elapsed / 300, 1);
      animScale.current   = 0.95 + 0.05 * p;
      animOpacity.current = p;
      if (p >= 1) {
        phase.current      = 'idle';
        animScale.current   = 1.0;
        animOpacity.current = 1.0;
      }
    } else if (phase.current === 'pulse') {
      const p = Math.min(elapsed / 300, 1);
      animScale.current   = 1.0 + 0.02 * Math.sin(p * Math.PI);
      animOpacity.current = 1.0;
      if (p >= 1) {
        phase.current    = 'idle';
        animScale.current = 1.0;
      }
    }
  }

  return { animScale, animOpacity, triggerTransition, tickAnimation };
}
