// utils/statuses.js - Stati condivisi tra frontend e backend

export const STATUSES = {
  'ANDRE-INA': { label: 'ANDRE-INA', code: 'ANDRE_INA', selectable: true },
  'ANNULLATA': { label: 'ANNULLATA', code: 'CANCELLED', selectable: true },
  'ANULLATA': { label: 'ANULLATA', code: 'CANCELLED_ALT', selectable: true },
  'APERTA': { label: 'APERTA', code: 'OPEN', selectable: true },
  'ARCHIVIO': { label: 'ARCHIVIO', code: 'ARCHIVED', selectable: true },
  'ARCHIVIO BLACK LIST': { label: 'ARCHIVIO BLACK LIST', code: 'ARCHIVED_BLACKLIST', selectable: true },
  'ARCHIVIO CAPI': { label: 'ARCHIVIO CAPI', code: 'ARCHIVED_ITEMS', selectable: true },
  'ARCHIVIO GR': { label: 'ARCHIVIO GR', code: 'ARCHIVED_GR', selectable: true },
  'ARCHIVIO GR P.A.': { label: 'ARCHIVIO GR P.A.', code: 'ARCHIVED_GR_PA', selectable: true },
  'ARCHIVIO P.A.': { label: 'ARCHIVIO P.A.', code: 'ARCHIVED_PA', selectable: true },
  'ARCHIVO': { label: 'ARCHIVO', code: 'ARCHIVO', selectable: true },
  'ATTESA NEWS': { label: 'ATTESA NEWS', code: 'WAITING_NEWS', selectable: true },
  'ATTESA RD': { label: 'ATTESA RD', code: 'WAITING_RD', selectable: true },
  'CAMION': { label: 'CAMION', code: 'TRUCK', selectable: true },
  'CANCELLATA RD': { label: 'CANCELLATA RD', code: 'CANCELLED_RD', selectable: true },
  'CASSA': { label: 'CASSA', code: 'CASH_DESK', selectable: true },
  'CHIARA': { label: 'CHIARA', code: 'CHIARA', selectable: true },
  'CHIUSA': { label: 'CHIUSA', code: 'CLOSED', selectable: true },
  'DA ANNULLARE': { label: 'DA ANNULLARE', code: 'TO_CANCEL', selectable: true },
  'DISPUTA': { label: 'DISPUTA', code: 'DISPUTE', selectable: true },
  'DISPUTA AX': { label: 'DISPUTA AX', code: 'DISPUTE_AX', selectable: true },
  'FOLDER HARTLAND': { label: 'FOLDER HARTLAND', code: 'FOLDER_HARTLAND', selectable: true },
  'FOLDER IGOR': { label: 'FOLDER IGOR', code: 'FOLDER_IGOR', selectable: true },
  'FOLDER LAGOS': { label: 'FOLDER LAGOS', code: 'FOLDER_LAGOS', selectable: true },
  'FOLDER LAMSAM': { label: 'FOLDER LAMSAM', code: 'FOLDER_LAMSAM', selectable: true },
  'FOLDER MARWA': { label: 'FOLDER MARWA', code: 'FOLDER_MARWA', selectable: true },
  'FOLDER NAKASATO': { label: 'FOLDER NAKASATO', code: 'FOLDER_NAKASATO', selectable: true },
  'FOLDER RIO': { label: 'FOLDER RIO', code: 'FOLDER_RIO', selectable: true },
  'FOLDER ROSSO': { label: 'FOLDER ROSSO', code: 'FOLDER_ROSSO', selectable: true },
  'FOLDER SAMIR': { label: 'FOLDER SAMIR', code: 'FOLDER_SAMIR', selectable: true },
  'FOLDER SHANGHAI': { label: 'FOLDER SHANGHAI', code: 'FOLDER_SHANGHAI', selectable: true },
  'FOLDER TARIKO': { label: 'FOLDER TARIKO', code: 'FOLDER_TARIKO', selectable: true },
  'G & G': { label: 'G & G', code: 'G_AND_G', selectable: true },
  'GIX': { label: 'GIX', code: 'GIX', selectable: true },
  'IMBALLO': { label: 'IMBALLO', code: 'PACKING', selectable: true },
  'LEA': { label: 'LEA', code: 'LEA', selectable: true },
  'MONITORARE': { label: 'MONITORARE', code: 'MONITOR', selectable: true },
  'P.A.': { label: 'P.A.', code: 'PA', selectable: true },
  'PROFORMA': { label: 'PROFORMA', code: 'PROFORMA', selectable: true },
  'SPEDIRE': { label: 'SPEDIRE', code: 'TO_SHIP', selectable: true },
  'SPEDIRE DHL': { label: 'SPEDIRE DHL', code: 'TO_SHIP_DHL', selectable: true },
  'SPEDIRE EXP SHIP': { label: 'SPEDIRE EXP SHIP', code: 'TO_SHIP_EXP', selectable: true },
  'SPEDIRE UPS': { label: 'SPEDIRE UPS', code: 'TO_SHIP_UPS', selectable: true },
  'SPEDITO': { label: 'SPEDITO', code: 'SHIPPED', selectable: true },
  'SPEDITOAR': { label: 'SPEDITOAR', code: 'SHIPPED_AR', selectable: true },
  'STORNO': { label: 'STORNO', code: 'REFUND', selectable: true },
  'VI': { label: 'VI', code: 'VI', selectable: true },
  'VIC': { label: 'VIC', code: 'VIC', selectable: true },
  'XY': { label: 'XY', code: 'XY', selectable: true }
}

/**
 * Ottieni tutti gli stati selezionabili per dropdown/select
 * @returns {Array<{label: string, value: string, code: string}>}
 */
export function getSelectableStatuses() {
  return Object.entries(STATUSES)
    .filter(([key, value]) => value.selectable)
    .map(([key, value]) => ({
      label: value.label,
      value: key,
      code: value.code
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

/**
 * Ottieni tutti gli stati (anche non selezionabili)
 * @returns {Array<string>}
 */
export function getAllStatuses() {
  return Object.keys(STATUSES).sort()
}

/**
 * Verifica se uno stato esiste
 * @param {string} value
 * @returns {boolean}
 */
export function isValidStatus(value) {
  return STATUSES.hasOwnProperty(value)
}

/**
 * Verifica se uno stato è selezionabile
 * @param {string} value
 * @returns {boolean}
 */
export function isSelectableStatus(value) {
  return STATUSES[value]?.selectable === true
}

/**
 * Ottieni la label di uno stato
 * @param {string} value
 * @returns {string}
 */
export function getStatusLabel(value) {
  return STATUSES[value]?.label || value
}

/**
 * Ottieni il codice di uno stato
 * @param {string} value
 * @returns {string}
 */
export function getStatusCode(value) {
  return STATUSES[value]?.code || value
}

/**
 * Ottieni uno stato dal codice
 * @param {string} code
 * @returns {Object|null}
 */
export function getStatusByCode(code) {
  const entry = Object.entries(STATUSES).find(([key, value]) => value.code === code)
  return entry ? { key: entry[0], ...entry[1] } : null
}