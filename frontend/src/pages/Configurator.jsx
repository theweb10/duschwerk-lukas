import { useState } from 'react'
import GlassPreview from '../components/sections/GlassPreview'
import ConfiguratorForm from '../components/sections/ConfiguratorForm'

// ── Step definitions ──────────────────────────────────────────────────────────

const STEPS = [
  {
    id: 'typ',
    title: 'Duschtyp wählen',
    subtitle: 'Welche Art von Dusche planen Sie?',
    type: 'cards',
    options: [
      { value: 'Walk-in',    label: 'Walk-in',    desc: 'Offen, ohne Tür' },
      { value: 'Drehtür',    label: 'Drehtür',    desc: 'Klassisch mit Drehtür' },
      { value: 'Schiebetür', label: 'Schiebetür', desc: 'Platzsparend' },
      { value: 'Nische',     label: 'Nische',     desc: 'Eingebaut zwischen Wänden' },
    ],
  },
  {
    id: 'glas',
    title: 'Glasart wählen',
    subtitle: 'Optik und Privatsphäre nach Ihrem Geschmack.',
    type: 'cards',
    options: [
      { value: 'Klarglas',      label: 'Klarglas',      desc: 'Maximale Transparenz' },
      { value: 'Satinato',      label: 'Satinato',      desc: 'Satin-mattiert' },
      { value: 'Parsol Bronze', label: 'Parsol Bronze', desc: 'Getönt bronzefarben' },
      { value: 'Parsol Grau',   label: 'Parsol Grau',   desc: 'Getönt grau' },
    ],
  },
  {
    id: 'staerke',
    title: 'Glasstärke wählen',
    subtitle: 'Dickeres Glas – mehr Stabilität und Wertigkeit.',
    type: 'cards',
    options: [
      { value: '6mm',  label: '6 mm',  desc: 'Standard' },
      { value: '8mm',  label: '8 mm',  desc: 'Empfohlen' },
      { value: '10mm', label: '10 mm', desc: 'Premium' },
    ],
  },
  {
    id: 'profil',
    title: 'Profilfarbe wählen',
    subtitle: 'Passend zu Ihrer Badausstattung.',
    type: 'cards',
    options: [
      { value: 'Chrom poliert',       label: 'Chrom poliert',       desc: 'Klassisch glänzend' },
      { value: 'Edelstahl gebürstet', label: 'Edelstahl gebürstet', desc: 'Modern matt' },
      { value: 'Schwarz matt',        label: 'Schwarz matt',        desc: 'Zeitlos dunkel' },
    ],
  },
  {
    id: 'masse',
    title: 'Maße eingeben',
    subtitle: 'Breite und Höhe Ihrer gewünschten Dusche.',
    type: 'sliders',
    fields: [
      { id: 'breite', label: 'Breite', min: 60, max: 200, default: 120, unit: 'cm' },
      { id: 'hoehe',  label: 'Höhe',   min: 150, max: 220, default: 200, unit: 'cm' },
    ],
  },
  {
    id: 'extras',
    title: 'Extras hinzufügen',
    subtitle: 'Optionale Erweiterungen für mehr Komfort.',
    type: 'multicheck',
    options: [
      { value: 'Nano-Beschichtung',  label: 'Nano-Beschichtung',  desc: 'Wasserabweisend, leicht zu reinigen' },
      { value: 'Handtuchhaken',      label: 'Handtuchhaken',      desc: '2× Edelstahl-Haken' },
      { value: 'Glasreiniger-Set',   label: 'Glasreiniger-Set',   desc: 'Professionelles Pflege-Kit' },
    ],
  },
]

const TOTAL_STEPS = STEPS.length // 6 config steps, then form (step 7)

// ── Progress Bar ──────────────────────────────────────────────────────────────

function ProgressBar({ current }) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-1.5 mb-3">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
          const state = i < current ? 'done' : i === current ? 'active' : 'pending'
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                background:
                  state === 'done'   ? '#C62828' :
                  state === 'active' ? '#1F2E4A' :
                  '#E5E7EB',
                transition: 'background 0.3s ease',
              }}
            />
          )
        })}
      </div>
      <p className="text-xs text-gray-400 font-light">
        Schritt <span className="font-medium text-primary">{Math.min(current + 1, TOTAL_STEPS)}</span> von {TOTAL_STEPS}
      </p>
    </div>
  )
}

// ── Option Card ───────────────────────────────────────────────────────────────

function OptionCard({ option, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left transition-all duration-200"
      style={{
        padding: '16px',
        borderRadius: '10px',
        border: selected ? '2px solid #1F2E4A' : '2px solid #E5E7EB',
        background: selected ? '#F0F4FF' : '#FAFAFA',
        cursor: 'pointer',
        outline: 'none',
        boxShadow: selected ? '0 0 0 3px rgba(31,46,74,0.08)' : 'none',
      }}
    >
      <div
        className="font-medium text-sm mb-0.5"
        style={{ color: selected ? '#1F2E4A' : '#374151' }}
      >
        {option.label}
      </div>
      {option.desc && (
        <div className="text-xs font-light" style={{ color: '#9CA3AF' }}>
          {option.desc}
        </div>
      )}
    </button>
  )
}

// ── Slider Field ──────────────────────────────────────────────────────────────

function SliderField({ field, value, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {field.label}
        </label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={field.min}
            max={field.max}
            value={value}
            onChange={(e) => {
              const v = Math.min(field.max, Math.max(field.min, Number(e.target.value)))
              onChange(v)
            }}
            className="input-apple text-center"
            style={{ width: '72px', padding: '4px 8px', fontSize: '14px' }}
          />
          <span className="text-xs text-gray-400">{field.unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={field.min}
        max={field.max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: '#1F2E4A' }}
      />
      <div className="flex justify-between text-xs text-gray-300 mt-1 font-light">
        <span>{field.min} {field.unit}</span>
        <span>{field.max} {field.unit}</span>
      </div>
    </div>
  )
}

// ── Step Content ──────────────────────────────────────────────────────────────

function StepContent({ step, config, onUpdate }) {
  if (step.type === 'cards') {
    const selected = config[step.id]
    const cols = step.options.length <= 3 ? step.options.length : 2
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: '10px',
        }}
      >
        {step.options.map((opt) => (
          <OptionCard
            key={opt.value}
            option={opt}
            selected={selected === opt.value}
            onClick={() => onUpdate({ [step.id]: opt.value })}
          />
        ))}
      </div>
    )
  }

  if (step.type === 'sliders') {
    return (
      <div className="space-y-6">
        {step.fields.map((field) => (
          <SliderField
            key={field.id}
            field={field}
            value={config[field.id] ?? field.default}
            onChange={(val) => onUpdate({ [field.id]: val })}
          />
        ))}
      </div>
    )
  }

  if (step.type === 'multicheck') {
    const selected = config.extras || []
    return (
      <div className="space-y-3">
        {step.options.map((opt) => {
          const checked = selected.includes(opt.value)
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                const next = checked
                  ? selected.filter((v) => v !== opt.value)
                  : [...selected, opt.value]
                onUpdate({ extras: next })
              }}
              className="w-full text-left flex items-start gap-3 transition-all duration-200"
              style={{
                padding: '14px 16px',
                borderRadius: '10px',
                border: checked ? '2px solid #1F2E4A' : '2px solid #E5E7EB',
                background: checked ? '#F0F4FF' : '#FAFAFA',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  border: checked ? 'none' : '2px solid #D1D5DB',
                  background: checked ? '#1F2E4A' : 'transparent',
                  flexShrink: 0,
                  marginTop: '1px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {checked && (
                  <svg width="11" height="9" fill="none" viewBox="0 0 11 9">
                    <path d="M1 4l3 3 6-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: '#1F2E4A' }}>{opt.label}</div>
                {opt.desc && <div className="text-xs font-light text-gray-400">{opt.desc}</div>}
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  return null
}

// ── Main Configurator Page ────────────────────────────────────────────────────

const defaultConfig = {
  typ:     'Walk-in',
  glas:    'Klarglas',
  staerke: '8mm',
  profil:  'Chrom poliert',
  breite:  120,
  hoehe:   200,
  extras:  [],
}

export default function Configurator() {
  const [step, setStep] = useState(0)
  const [config, setConfig] = useState(defaultConfig)
  const showForm = step >= TOTAL_STEPS

  function updateConfig(partial) {
    setConfig((prev) => ({ ...prev, ...partial }))
  }

  function canAdvance() {
    const s = STEPS[step]
    if (!s) return true
    if (s.type === 'cards') return !!config[s.id]
    if (s.type === 'sliders') return true
    if (s.type === 'multicheck') return true
    return true
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #F8FAFC 0%, #EEF2FF 100%)',
        paddingTop: '90px',
        paddingBottom: '60px',
      }}
    >
      <div className="container-max px-4 sm:px-6 lg:px-8">

        {/* Page header */}
        <div className="mb-8 max-w-xl">
          <p
            className="text-xs font-medium uppercase tracking-[0.18em] mb-2"
            style={{ color: '#C62828' }}
          >
            Konfigurator
          </p>
          <h1
            className="font-headline font-bold"
            style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', color: '#1F2E4A', letterSpacing: '-0.03em', lineHeight: 1.1 }}
          >
            Ihre Wunschdusche<br />in 6 Schritten.
          </h1>
        </div>

        {/* Progress */}
        {!showForm && (
          <div className="mb-8 max-w-2xl">
            <ProgressBar current={step} />
          </div>
        )}

        {showForm ? (
          /* ── Step 7: Form ─────────────────────────────────────────────── */
          <div className="max-w-2xl">
            <div
              style={{
                background: '#fff',
                borderRadius: '16px',
                padding: 'clamp(24px, 4vw, 40px)',
                boxShadow: '0 4px 40px rgba(0,0,0,0.07)',
              }}
            >
              <div className="mb-6">
                <h2
                  className="font-headline font-bold text-xl mb-1"
                  style={{ color: '#1F2E4A', letterSpacing: '-0.02em' }}
                >
                  Anfrage senden
                </h2>
                <p className="text-sm text-gray-400 font-light">
                  Ihre Konfiguration ist vorausgefüllt – passen Sie die Nachricht gerne an.
                </p>
              </div>
              <ConfiguratorForm config={config} />
              <button
                type="button"
                onClick={() => setStep(TOTAL_STEPS - 1)}
                className="mt-4 text-xs text-gray-400 hover:text-primary transition-colors flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Zurück zur Konfiguration
              </button>
            </div>
          </div>
        ) : (
          /* ── Steps 1–6 ────────────────────────────────────────────────── */
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* Preview (mobile: top, desktop: right side) */}
            <div
              className="w-full lg:order-2"
              style={{ flex: '0 0 45%' }}
            >
              <div
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  padding: '28px 24px',
                  boxShadow: '0 4px 40px rgba(0,0,0,0.07)',
                  position: 'sticky',
                  top: '90px',
                }}
              >
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
                  Vorschau
                </p>
                <GlassPreview config={config} />
              </div>
            </div>

            {/* Step panel */}
            <div
              className="w-full lg:order-1"
              style={{ flex: '0 0 55%' }}
            >
              <div
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  padding: 'clamp(24px, 4vw, 36px)',
                  boxShadow: '0 4px 40px rgba(0,0,0,0.07)',
                }}
              >
                <div className="mb-6">
                  <h2
                    className="font-headline font-bold text-xl mb-1"
                    style={{ color: '#1F2E4A', letterSpacing: '-0.02em' }}
                  >
                    {STEPS[step].title}
                  </h2>
                  <p className="text-sm text-gray-400 font-light">
                    {STEPS[step].subtitle}
                  </p>
                </div>

                <StepContent
                  step={STEPS[step]}
                  config={config}
                  onUpdate={updateConfig}
                />

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-5" style={{ borderTop: '1px solid #F3F4F6' }}>
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0}
                    className="flex items-center gap-1.5 text-sm font-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ color: '#6B7280' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    Zurück
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep((s) => s + 1)}
                    disabled={!canAdvance()}
                    className="btn-primary px-6 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {step === TOTAL_STEPS - 1 ? 'Zur Anfrage →' : 'Weiter →'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
