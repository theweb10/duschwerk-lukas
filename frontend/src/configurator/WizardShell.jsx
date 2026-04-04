import React from 'react';
import StepEinstieg from './steps/StepEinstieg';
import StepSerie from './steps/StepSerie';
import StepEinbausituation from './steps/StepEinbausituation';
import StepMasse from './steps/StepMasse';
import StepDesign from './steps/StepDesign';
import StepZusammenfassung from './steps/StepZusammenfassung';

const STEPS = [
  { label: 'Start',         key: 'einstieg' },
  { label: 'Serie',         key: 'serie' },
  { label: 'Einbau',        key: 'einbau' },
  { label: 'Maße',          key: 'masse' },
  { label: 'Design',        key: 'design' },
  { label: 'Zusammenfassung', key: 'summary' },
];

export default function WizardShell({
  step, config, options, corrections, validation, summary, canProceed,
  setField, nextStep, prevStep, goToStep, submit, reset,
}) {
  const renderStep = () => {
    switch (step) {
      case 0: return <StepEinstieg onNext={nextStep} />;
      case 1: return <StepSerie config={config} setField={setField} />;
      case 2: return <StepEinbausituation config={config} setField={setField} options={options} />;
      case 3: return <StepMasse config={config} setField={setField} options={options} />;
      case 4: return <StepDesign config={config} setField={setField} options={options} corrections={corrections} />;
      case 5: return <StepZusammenfassung summary={summary} validation={validation} onSubmit={submit} onReset={reset} />;
      default: return null;
    }
  };

  return (
    <div className="wizard-shell">
      {/* Stepper */}
      <div className="wizard-stepper">
        {STEPS.map((s, i) => (
          <button
            key={s.key}
            className={`stepper-item${i === step ? ' active' : ''}${i < step ? ' done' : ''}`}
            onClick={() => goToStep(i)}
            disabled={i > step}
          >
            <span className="stepper-number">{i < step ? '✓' : i + 1}</span>
            <span className="stepper-label">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="wizard-content">
        {renderStep()}
      </div>

      {/* Navigation */}
      {step > 0 && (
        <div className="wizard-nav">
          <button className="btn-outline wizard-back" onClick={prevStep}>
            Zurück
          </button>
          {step < 5 && (
            <button
              className="btn-primary wizard-next"
              onClick={nextStep}
              disabled={!canProceed}
            >
              Weiter
            </button>
          )}
        </div>
      )}
    </div>
  );
}
