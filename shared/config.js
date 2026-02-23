// shared/config.js
// Leggibile sia dal client (app/) che dal server (server/)
// In Nuxt 4 la cartella shared/ è auto-importata con alias #shared
//
// Uso nel client:  import { getConfigValue } from '#shared/config'
// Uso nel server:  import { getConfigValue } from '#shared/config'

export const APP_CONFIG = [
  {
    code: "AUTOSAVE",
    value: 10, // secondi tra un autosave e l'altro (0 = disabilitato)
    active: true,
  },
  {
    code: "PRINTFIELDS",
    value: ["firstname", "lastname"],
    active: true,
  },
  {
    code: "INVOICEFORMAT",
    value: "{TYPE}00{VALUE}/{YEAR}",
    active: true,
  },
];

/**
 * Recupera una voce di config per codice
 * @param {string} code
 * @returns {{ code, value, active } | undefined}
 */
export const getConfig = (code) => {
  return APP_CONFIG.find((c) => c.code === code);
};

/**
 * Recupera il value (solo se active: true)
 * @param {string} code
 * @param {*} fallback
 */
export const getConfigValue = (code, fallback = null) => {
  const entry = getConfig(code);
  if (!entry || !entry.active) return fallback;
  return entry.value;
};

/**
 * Verifica se una config è attiva
 * @param {string} code
 * @returns {boolean}
 */
export const isConfigActive = (code) => {
  return getConfig(code)?.active === true;
};
