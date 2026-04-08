// Pure mapping — no hooks
const THICKNESS_MAP = { '6mm': 0.006, '8mm': 0.008, '10mm': 0.010 };

const FALLBACK_GLASS = { color: '#ffffff', roughness: 0.02, transmission: 0.98, glasTyp: 'klarglas' };
const FALLBACK_METAL = { color: '#E8E8E8', metalness: 0.95, roughness: 0.03, metalTyp: 'poliert' };

export function mapConfig(config) {
  const w = (config.breite || 90) / 100;
  const h = (config.hoehe  || 200) / 100;
  const t = THICKNESS_MAP[config.staerke] ?? 0.06;

  // configTo3D now passes render objects directly — use them if available
  const glass = (config.glass && typeof config.glass === 'object') ? config.glass : FALLBACK_GLASS;
  const metal = (config.metal && typeof config.metal === 'object') ? config.metal : FALLBACK_METAL;

  const typ = config.typ ?? 'Walk-in';
  return { w, h, t, glass, metal, typ };
}
