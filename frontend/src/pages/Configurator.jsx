import { useMemo } from 'react';
import ShowerCanvas from '../components/3d/ShowerCanvas';
import WizardShell from '../configurator/WizardShell';
import { useConfiguratorState } from '../configurator/state/useConfiguratorState';
import { configTo3D } from '../configurator/engine/configTo3D';
import { EINBAUSITUATIONEN } from '../configurator/data/productCatalog';

/**
 * isConfigurationComplete
 *
 * TRUE wenn:
 * - Serie gewählt
 * - Einbausituation gewählt
 * - Breite + Höhe gesetzt
 * - Türsystem gewählt (wenn Einbau eine Tür braucht)
 * - Glastyp, Glasstärke, Profilfarbe gewählt
 */
function isConfigurationComplete(config) {
  if (!config.serie)           return false;
  if (!config.einbausituation) return false;
  if (!config.breite || !config.hoehe) return false;
  if (!config.glastyp)         return false;
  if (!config.glasstaerke)     return false;
  if (!config.profilfarbe)     return false;

  // Türsystem: nur erforderlich wenn Einbausituation eine Tür hat
  const einbau = EINBAUSITUATIONEN.find(e => e.id === config.einbausituation);
  if (einbau && einbau.kompatibleTuersysteme.length > 0 && !config.tuersystem) {
    return false;
  }

  return true;
}

export default function Configurator() {
  const state = useConfiguratorState();

  const isComplete  = useMemo(() => isConfigurationComplete(state.config), [state.config]);
  const canvasConfig = useMemo(() => configTo3D(state.config), [state.config]);

  return (
    <div className="konfigurator-page">
      <div className="konfigurator-layout">
        {/* 3D Viewer */}
        <div className="konfigurator-viewer">
          <ShowerCanvas config={canvasConfig} isComplete={isComplete} />
        </div>

        {/* Wizard */}
        <div className="konfigurator-panel wizard-panel">
          <WizardShell
            step={state.step}
            config={state.config}
            options={state.options}
            corrections={state.corrections}
            validation={state.validation}
            summary={state.summary}
            canProceed={state.canProceed}
            setField={state.setField}
            nextStep={state.nextStep}
            prevStep={state.prevStep}
            goToStep={state.goToStep}
            submit={state.submit}
            reset={state.reset}
          />
        </div>
      </div>
    </div>
  );
}
