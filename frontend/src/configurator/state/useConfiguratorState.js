import { useReducer, useCallback, useMemo } from 'react';
import {
  autoCorrect,
  isStepComplete,
  validateConfig,
  getVerfuegbareEinbausituationen,
  getVerfuegbareTuersysteme,
  getVerfuegbareGlastypen,
  getVerfuegbareGlasstaerken,
  getVerfuegbareProfilfarben,
  getVerfuegbareRahmentypen,
  getMassConstraints,
  generateSummary,
} from '../engine/ruleEngine';

const TOTAL_STEPS = 7; // 0..6

const INITIAL_CONFIG = {
  einbausituation: null,
  tuersystem: null,
  rahmentyp: null,
  breite: 90,
  tiefe: 90,
  hoehe: 200,
  glastyp: 'klarglas',
  profilfarbe: 'metall-hg',
};

const INITIAL_STATE = {
  step: 0,
  config: INITIAL_CONFIG,
  corrections: [],
  submitted: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD': {
      const newConfig = { ...state.config, [action.field]: action.value };
      const { config: corrected, changes } = autoCorrect(newConfig);
      return { ...state, config: corrected, corrections: changes };
    }
    case 'NEXT_STEP': {
      if (state.step >= TOTAL_STEPS - 1) return state;
      if (!isStepComplete(state.step, state.config)) return state;
      return { ...state, step: state.step + 1, corrections: [] };
    }
    case 'PREV_STEP': {
      if (state.step <= 0) return state;
      return { ...state, step: state.step - 1, corrections: [] };
    }
    case 'GO_TO_STEP': {
      const target = action.step;
      if (target < 0 || target >= TOTAL_STEPS) return state;
      if (target < state.step) {
        return { ...state, step: target, corrections: [] };
      }
      if (target > state.step + 1) return state;
      for (let i = 0; i < target; i++) {
        if (!isStepComplete(i, state.config)) return state;
      }
      return { ...state, step: target, corrections: [] };
    }
    case 'SUBMIT': {
      const { valid } = validateConfig(state.config);
      if (!valid) return state;
      return { ...state, submitted: true };
    }
    case 'RESET': {
      return { ...INITIAL_STATE };
    }
    default:
      return state;
  }
}

export function useConfiguratorState() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const setField   = useCallback((field, value) => dispatch({ type: 'SET_FIELD', field, value }), []);
  const nextStep   = useCallback(() => dispatch({ type: 'NEXT_STEP' }), []);
  const prevStep   = useCallback(() => dispatch({ type: 'PREV_STEP' }), []);
  const goToStep   = useCallback((step) => dispatch({ type: 'GO_TO_STEP', step }), []);
  const submit     = useCallback(() => dispatch({ type: 'SUBMIT' }), []);
  const reset      = useCallback(() => dispatch({ type: 'RESET' }), []);

  const options = useMemo(() => {
    const { einbausituation, tuersystem, hoehe } = state.config;
    return {
      einbausituationen: getVerfuegbareEinbausituationen(),
      tuersysteme:       getVerfuegbareTuersysteme(einbausituation),
      rahmentypen:       getVerfuegbareRahmentypen(tuersystem),
      glastypen:         getVerfuegbareGlastypen(tuersystem),
      glasstaerken:      getVerfuegbareGlasstaerken(hoehe),
      profilfarben:      getVerfuegbareProfilfarben(),
      massConstraints:   getMassConstraints(einbausituation, tuersystem),
    };
  }, [state.config]);

  const validation = useMemo(() => validateConfig(state.config), [state.config]);
  const summary    = useMemo(() => generateSummary(state.config), [state.config]);
  const canProceed = useMemo(() => isStepComplete(state.step, state.config), [state.step, state.config]);

  return {
    ...state,
    options,
    validation,
    summary,
    canProceed,
    setField,
    nextStep,
    prevStep,
    goToStep,
    submit,
    reset,
  };
}
