// utils/couriers.js - Corrieri condivisi tra frontend e backend

export const COURIERS = {
  'DAZI DOG.': { label: 'DAZI DOG.', code: 'DAZI_DOG', selectable: true },
  'DAZI': { label: 'DAZI', code: 'DAZI', selectable: true },
  'EX.SH.DAZIO': { label: 'EX.SH.DAZIO', code: 'EX_SH_DAZIO', selectable: true },
  'DEI ROSSI SH': { label: 'DEI ROSSI SH', code: 'DEI_ROSSI_SH', selectable: true },
  'DHL': { label: 'DHL', code: 'DHL', selectable: true },
  'DHL 2^SHIP': { label: 'DHL 2^SHIP', code: 'DHL_2SHIP', selectable: true },
  'DHL 1^ SHIP': { label: 'DHL 1^ SHIP', code: 'DHL_1SHIP', selectable: true },
  'DHL 2^ SHIP': { label: 'DHL 2^ SHIP', code: 'DHL_2SHIP_ALT', selectable: true },
  'DHL BUSTA': { label: 'DHL BUSTA', code: 'DHL_BUSTA', selectable: true },
  'DHL DAZI': { label: 'DHL DAZI', code: 'DHL_DAZI', selectable: true },
  'DHL DOC': { label: 'DHL DOC', code: 'DHL_DOC', selectable: true },
  'DHL DOCUM.': { label: 'DHL DOCUM.', code: 'DHL_DOCUM', selectable: true },
  'DHL DOGANA': { label: 'DHL DOGANA', code: 'DHL_DOGANA', selectable: true },
  'DHL FLYER': { label: 'DHL FLYER', code: 'DHL_FLYER', selectable: true },
  'DHL FLYER R.': { label: 'DHL FLYER R.', code: 'DHL_FLYER_R', selectable: true },
  'DHL GIFT': { label: 'DHL GIFT', code: 'DHL_GIFT', selectable: true },
  'DHL OMAGGIO': { label: 'DHL OMAGGIO', code: 'DHL_OMAGGIO', selectable: true },
  'DHL PROFORMA': { label: 'DHL PROFORMA', code: 'DHL_PROFORMA', selectable: true },
  'DHL REINOLTR': { label: 'DHL REINOLTR', code: 'DHL_REINOLTR', selectable: true },
  'DHL REPL': { label: 'DHL REPL', code: 'DHL_REPL', selectable: true },
  'DHL REPL.': { label: 'DHL REPL.', code: 'DHL_REPL_ALT', selectable: true },
  'DHL RIENTRO': { label: 'DHL RIENTRO', code: 'DHL_RIENTRO', selectable: true },
  'DHL RIMP': { label: 'DHL RIMP', code: 'DHL_RIMP', selectable: true },
  'DHL RIMP.': { label: 'DHL RIMP.', code: 'DHL_RIMP_ALT', selectable: true },
  'DHL RIT.': { label: 'DHL RIT.', code: 'DHL_RIT', selectable: true },
  'DHL RITORNO': { label: 'DHL RITORNO', code: 'DHL_RITORNO', selectable: true },
  'DHL SPECCHIO': { label: 'DHL SPECCHIO', code: 'DHL_SPECCHIO', selectable: true },
  'DHL-GIFT': { label: 'DHL-GIFT', code: 'DHL_GIFT_ALT', selectable: true },
  'DHL-OMAGGIO': { label: 'DHL-OMAGGIO', code: 'DHL_OMAGGIO_ALT', selectable: true },
  'DHL-SAMPLE': { label: 'DHL-SAMPLE', code: 'DHL_SAMPLE', selectable: true },
  'DIFF PESO': { label: 'DIFF PESO', code: 'DIFF_PESO', selectable: true },
  'DIFF.P.T.': { label: 'DIFF.P.T.', code: 'DIFF_PT', selectable: true },
  'DIFF.P.TASS': { label: 'DIFF.P.TASS', code: 'DIFF_P_TASS', selectable: true },
  'DIFF.P.TASS.': { label: 'DIFF.P.TASS.', code: 'DIFF_P_TASS_ALT', selectable: true },
  'DIFF.PESO': { label: 'DIFF.PESO', code: 'DIFF_PESO_ALT', selectable: true },
  'DIFF.PESO T.': { label: 'DIFF.PESO T.', code: 'DIFF_PESO_T', selectable: true },
  'DII.PESO': { label: 'DII.PESO', code: 'DII_PESO', selectable: true },
  'DOCS': { label: 'DOCS', code: 'DOCS', selectable: true },
  'DUTY': { label: 'DUTY', code: 'DUTY', selectable: true },
  'EX  DIFF PES': { label: 'EX  DIFF PES', code: 'EX_DIFF_PES', selectable: true },
  'EX CONS FZ': { label: 'EX CONS FZ', code: 'EX_CONS_FZ', selectable: true },
  'EX CORR INDEX DAZI': { label: 'EX CORR INDEX DAZI', code: 'EX_CORR_INDEX_DAZI', selectable: true },
  'EX DAZIO': { label: 'EX DAZIO', code: 'EX_DAZIO', selectable: true },
  'EX DIFF PE': { label: 'EX DIFF PE', code: 'EX_DIFF_PE', selectable: true },
  'EX DIFF PESO': { label: 'EX DIFF PESO', code: 'EX_DIFF_PESO', selectable: true },
  'EX DUTY': { label: 'EX DUTY', code: 'EX_DUTY', selectable: true },
  'EX RIEN MER': { label: 'EX RIEN MER', code: 'EX_RIEN_MER', selectable: true },
  'EX S-GIFT': { label: 'EX S-GIFT', code: 'EX_S_GIFT', selectable: true },
  'EX SH DIF PE': { label: 'EX SH DIF PE', code: 'EX_SH_DIF_PE', selectable: true },
  'EX SH DIFF PE': { label: 'EX SH DIFF PE', code: 'EX_SH_DIFF_PE', selectable: true },
  'EX SH domici': { label: 'EX SH domici', code: 'EX_SH_DOMICI', selectable: true },
  'EX SH DUTY': { label: 'EX SH DUTY', code: 'EX_SH_DUTY', selectable: true },
  'EX SH FZONA': { label: 'EX SH FZONA', code: 'EX_SH_FZONA', selectable: true },
  'EX Shcon sab': { label: 'EX Shcon sab', code: 'EX_SHCON_SAB', selectable: true },
  'EX SHIP': { label: 'EX SHIP', code: 'EX_SHIP', selectable: true },
  'EXP  2^ CONS': { label: 'EXP  2^ CONS', code: 'EXP_2_CONS', selectable: true },
  'EXP  SH. DPT': { label: 'EXP  SH. DPT', code: 'EXP_SH_DPT', selectable: true },
  'EXP C.F.Z.': { label: 'EXP C.F.Z.', code: 'EXP_CFZ', selectable: true },
  'EXP COR.IND': { label: 'EXP COR.IND', code: 'EXP_COR_IND', selectable: true },
  'EXP CORR.IND': { label: 'EXP CORR.IND', code: 'EXP_CORR_IND', selectable: true },
  'EXP CORR/IND': { label: 'EXP CORR/IND', code: 'EXP_CORR_IND_ALT', selectable: true },
  'EXP DAZI': { label: 'EXP DAZI', code: 'EXP_DAZI', selectable: true },
  'EXP DAZIO': { label: 'EXP DAZIO', code: 'EXP_DAZIO', selectable: true },
  'EXP DOGANA': { label: 'EXP DOGANA', code: 'EXP_DOGANA', selectable: true },
  'EXP RIENTRO': { label: 'EXP RIENTRO', code: 'EXP_RIENTRO', selectable: true },
  'EXP RISP.': { label: 'EXP RISP.', code: 'EXP_RISP', selectable: true },
  'EXP S 2^ R': { label: 'EXP S 2^ R', code: 'EXP_S_2R', selectable: true },
  'EXP S BUSTA': { label: 'EXP S BUSTA', code: 'EXP_S_BUSTA', selectable: true },
  'EXP S DAZI': { label: 'EXP S DAZI', code: 'EXP_S_DAZI', selectable: true },
  'EXP S GIFT': { label: 'EXP S GIFT', code: 'EXP_S_GIFT', selectable: true },
  'EXP S PICKUP': { label: 'EXP S PICKUP', code: 'EXP_S_PICKUP', selectable: true },
  'EXP S-GIFT': { label: 'EXP S-GIFT', code: 'EXP_S_GIFT_ALT', selectable: true },
  'EXP S. BUSTA': { label: 'EXP S. BUSTA', code: 'EXP_S_BUSTA_ALT', selectable: true },
  'EXP S. GIFT': { label: 'EXP S. GIFT', code: 'EXP_S_GIFT_ALT2', selectable: true },
  'EXP S.sample': { label: 'EXP S.sample', code: 'EXP_S_SAMPLE', selectable: true },
  'EXP SH.': { label: 'EXP SH.', code: 'EXP_SH', selectable: true },
  'EXP SH. GIFT': { label: 'EXP SH. GIFT', code: 'EXP_SH_GIFT', selectable: true },
  'EXP SH.busta': { label: 'EXP SH.busta', code: 'EXP_SH_BUSTA', selectable: true },
  'EXP SH.CFZ': { label: 'EXP SH.CFZ', code: 'EXP_SH_CFZ', selectable: true },
  'EXP SH.DAZI': { label: 'EXP SH.DAZI', code: 'EXP_SH_DAZI', selectable: true },
  'EXP SH.DIFF': { label: 'EXP SH.DIFF', code: 'EXP_SH_DIFF', selectable: true },
  'EXP SH.DPT': { label: 'EXP SH.DPT', code: 'EXP_SH_DPT_ALT', selectable: true },
  'EXP SHI': { label: 'EXP SHI', code: 'EXP_SHI', selectable: true },
  'EXP SHI dazi': { label: 'EXP SHI dazi', code: 'EXP_SHI_DAZI', selectable: true },
  'EXP SHIP': { label: 'EXP SHIP', code: 'EXP_SHIP', selectable: true },
  'EXP SHIP 1^': { label: 'EXP SHIP 1^', code: 'EXP_SHIP_1', selectable: true },
  'EXP SHIP 1^S': { label: 'EXP SHIP 1^S', code: 'EXP_SHIP_1S', selectable: true },
  'EXP SHIP 1SH': { label: 'EXP SHIP 1SH', code: 'EXP_SHIP_1SH', selectable: true },
  'EXP SHIP 2': { label: 'EXP SHIP 2', code: 'EXP_SHIP_2', selectable: true },
  'EXP SHIP 2 ^': { label: 'EXP SHIP 2 ^', code: 'EXP_SHIP_2_SPACE', selectable: true },
  'EXP SHIP 2^': { label: 'EXP SHIP 2^', code: 'EXP_SHIP_2_ALT', selectable: true },
  'EXP SHIP 2^S': { label: 'EXP SHIP 2^S', code: 'EXP_SHIP_2S', selectable: true },
  'EXP SHIP 2/3': { label: 'EXP SHIP 2/3', code: 'EXP_SHIP_2_3', selectable: true },
  'EXP SHIP 2SH': { label: 'EXP SHIP 2SH', code: 'EXP_SHIP_2SH', selectable: true },
  'EXP SHIP 3^': { label: 'EXP SHIP 3^', code: 'EXP_SHIP_3', selectable: true },
  'EXP SHIP 3^S': { label: 'EXP SHIP 3^S', code: 'EXP_SHIP_3S', selectable: true },
  'EXP SHIP 3SH': { label: 'EXP SHIP 3SH', code: 'EXP_SHIP_3SH', selectable: true },
  'FEDEX': { label: 'FEDEX', code: 'FEDEX', selectable: true },
  'FEDEX RIT.': { label: 'FEDEX RIT.', code: 'FEDEX_RIT', selectable: true },
  'UPS': { label: 'UPS', code: 'UPS', selectable: true },
  'UPS 1^ SHIP': { label: 'UPS 1^ SHIP', code: 'UPS_1SHIP', selectable: true },
  'UPS 2^ SHIP': { label: 'UPS 2^ SHIP', code: 'UPS_2SHIP', selectable: true },
  'PERSONALE': { label: 'PERSONALE', code: 'PERSONAL', selectable: true },
  'PICKUP': { label: 'PICKUP', code: 'PICKUP', selectable: true }
}

/**
 * Ottieni tutti i corrieri selezionabili per dropdown/select
 * @returns {Array<{label: string, value: string, code: string}>}
 */
export function getSelectableCouriers() {
  return Object.entries(COURIERS)
    .filter(([key, value]) => value.selectable)
    .map(([key, value]) => ({
      label: value.label,
      value: key,
      code: value.code
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

/**
 * Ottieni tutti i corrieri (anche non selezionabili)
 * @returns {Array<string>}
 */
export function getAllCouriers() {
  return Object.keys(COURIERS).sort()
}

/**
 * Verifica se un corriere esiste
 * @param {string} value
 * @returns {boolean}
 */
export function isValidCourier(value) {
  return COURIERS.hasOwnProperty(value)
}

/**
 * Verifica se un corriere è selezionabile
 * @param {string} value
 * @returns {boolean}
 */
export function isSelectableCourier(value) {
  return COURIERS[value]?.selectable === true
}

/**
 * Ottieni la label di un corriere
 * @param {string} value
 * @returns {string}
 */
export function getCourierLabel(value) {
  return COURIERS[value]?.label || value
}

/**
 * Ottieni il codice di un corriere
 * @param {string} value
 * @returns {string}
 */
export function getCourierCode(value) {
  return COURIERS[value]?.code || value
}

/**
 * Ottieni un corriere dal codice
 * @param {string} code
 * @returns {Object|null}
 */
export function getCourierByCode(code) {
  const entry = Object.entries(COURIERS).find(([key, value]) => value.code === code)
  return entry ? { key: entry[0], ...entry[1] } : null
}