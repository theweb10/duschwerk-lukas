import React from 'react';
import StepEinstieg from './steps/StepEinstieg';
import StepEinbausituation from './steps/StepEinbausituation';
import StepTuersystem from './steps/StepTuersystem';
import StepBauart from './steps/StepBauart';
import StepMasse from './steps/StepMasse';
import StepDesign from './steps/StepDesign';
import StepZusammenfassung from './steps/StepZusammenfassung';

const STEPS = [
  { label: 'Start',           key: 'einstieg',      short: 'Start' },
  { label: 'Einbausituation', key: 'einbau',         short: 'Einbau' },
  { label: 'Türart',          key: 'tuersystem',     short: 'Türart' },
  { label: 'Bauart',          key: 'bauart',         short: 'Bauart' },
  { label: 'Maße',            key: 'masse',          short: 'Maße' },
  { label: 'Design',          key: 'design',         short: 'Design' },
  { label: 'Anfrage',         key: 'summary',        short: 'Anfrage' },
];

export default function WizardShell({
  step, config, options, corrections, validation, summary, canProceed,
  setField, nextStep, prevStep, goToStep, submit, reset,
}) {
  const renderStep = () => {
    switch (step) {
      case 0: return <StepEinstieg onNext={nextStep} />;
      case 1: return <StepEinbausituation config={config} setField={setField} options={options} />;
      case 2: return <StepTuersystem config={config} setField={setField} options={options} />;
      case 3: return <StepBauart config={config} setField={setField} options={options} />;
      case 4: return <StepMasse config={config} setField={setField} options={options} />;
      case 5: return <StepDesign config={config} setField={setField} options={options} corrections={corrections} />;
      case 6: return <StepZusammenfassung summary={summary} validation={validation} onSubmit={submit} onReset={reset} />;
      default: return null;
    }
  };

  const activeSteps = STEPS.slice(1); // ohne Start-Schritt für den Stepper
  const stepIndex = step - 1; // 0-basiert ab Schritt 1

  return (
    <div className="wizard-shell">

      {/* ── Brand Header ───────────────────────── */}
      <div className="wizard-brand-header">
        <span className="wizard-brand-name">Duschwerk <span>Bayern</span></span>
        <span className="wizard-brand-tag">Konfigurator</span>
      </div>

      {/* ── Progress Stepper (nur ab Step 1) ─── */}
      {step > 0 && step < 6 && (
        <div className="wizard-progress-wrapper">
          <div className="wizard-progress-bar">
            <div
              className="wizard-progress-fill"
              style={{ width: `${(stepIndex / (activeSteps.length - 2)) * 100}%` }}
            />
          </div>
          <div className="wizard-steps-row">
            {activeSteps.slice(0, -1).map((s, i) => {
              const isDone   = i < stepIndex;
              const isActive = i === stepIndex;
              return (
                <button
                  key={s.key}
                  className={`wizard-step-dot${isDone ? ' done' : ''}${isActive ? ' active' : ''}`}
                  onClick={() => goToStep(i + 1)}
                  disabled={i > stepIndex}
                  title={s.label}
                >
                  <span className="dot-circle">
                    {isDone ? (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </span>
                  <span className="dot-label">{s.short}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Step Content ──────────────────────── */}
      <div className="wizard-content">
        {renderStep()}
      </div>

      {/* ── Navigation ───────────────────────── */}
      {step > 0 && (
        <div className="wizard-nav">
          <button className="wizard-back-btn" onClick={prevStep}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Zurück
          </button>
          {step < 6 && (
            <div className="wizard-nav-right">
              <span className="wizard-step-counter">{step} / 5</span>
              <button
                className={`wizard-next-btn${!canProceed ? ' disabled' : ''}`}
                onClick={nextStep}
                disabled={!canProceed}
              >
                {step === 5 ? 'Zur Anfrage' : 'Weiter'}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
