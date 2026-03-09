import { useState } from 'react';
import ShowerCanvas from '../components/3d/ShowerCanvas';
import ConfigPanel from '../components/configurator/ConfigPanel';

const DEFAULT_CONFIG = {
  typ:     'Walk-in',
  glas:    'Klarglas',
  staerke: '8mm',
  profil:  'Chrom poliert',
  breite:  120,
  hoehe:   200,
  extras:  [],
};

export default function Configurator() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  return (
    <div className="konfigurator-page">
      <div className="konfigurator-layout">
        <div className="konfigurator-viewer">
          <ShowerCanvas config={config} />
        </div>
        <div className="konfigurator-panel">
          <ConfigPanel config={config} onChange={setConfig} />
        </div>
      </div>
    </div>
  );
}
