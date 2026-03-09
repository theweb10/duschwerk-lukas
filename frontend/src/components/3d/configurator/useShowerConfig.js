// Pure mapping — no hooks
const THICKNESS_MAP = { '6mm': 0.04, '8mm': 0.06, '10mm': 0.08 };

const GLASS_CONFIGS = {
  'Klarglas':      { color: '#ffffff', roughness: 0.0,  transmission: 0.95 },
  'Satinato':      { color: '#e8eaf0', roughness: 0.8,  transmission: 0.5  },
  'Parsol Bronze': { color: '#CD7F32', roughness: 0.05, transmission: 0.75 },
  'Parsol Grau':   { color: '#808080', roughness: 0.05, transmission: 0.75 },
};

const METAL_CONFIGS = {
  'Chrom poliert':       { color: '#E8E8E8', metalness: 0.95, roughness: 0.05 },
  'Edelstahl gebürstet': { color: '#AAAAAA', metalness: 0.90, roughness: 0.20 },
  'Schwarz matt':        { color: '#222222', metalness: 0.70, roughness: 0.30 },
};

export function mapConfig(config) {
  const w = (config.breite || 90) / 100;
  const h = (config.hoehe  || 200) / 100;
  const t = THICKNESS_MAP[config.staerke] ?? 0.06;
  const glass = GLASS_CONFIGS[config.glas] ?? GLASS_CONFIGS['Klarglas'];
  const metal = METAL_CONFIGS[config.profil] ?? METAL_CONFIGS['Chrom poliert'];
  const typ   = config.typ ?? 'Walk-in';
  return { w, h, t, glass, metal, typ };
}
