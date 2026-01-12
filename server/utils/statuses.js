// server/utils/statuses.js - Backend Only
import Status from '~/server/models/Status'

/**
 * Ottieni tutti gli stati selezionabili per dropdown/select
 * @returns {Promise<Array<{label: string, value: string, code: string}>>}
 */
export async function getSelectableStatuses() {
  try {
    const statuses = await Status.find({ selectable: true })
      .select('code label')
      .sort({ label: 1 })
      .lean()

    return statuses.map(s => ({
      label: s.label,
      value: s.code,
      code: s.code
    }))
  } catch (error) {
    console.error('Errore getSelectableStatuses:', error)
    return []
  }
}

/**
 * Ottieni tutti gli stati (anche non selezionabili)
 * @returns {Promise<Array<{code: string, label: string, selectable: boolean}>>}
 */
export async function getAllStatuses() {
  try {
    return await Status.find()
      .select('code label selectable')
      .sort({ label: 1 })
      .lean()
  } catch (error) {
    console.error('Errore getAllStatuses:', error)
    return []
  }
}

/**
 * Verifica se uno stato esiste
 * @param {string} code
 * @returns {Promise<boolean>}
 */
export async function isValidStatus(code) {
  try {
    const count = await Status.countDocuments({ code })
    return count > 0
  } catch (error) {
    console.error('Errore isValidStatus:', error)
    return false
  }
}

/**
 * Verifica se uno stato è selezionabile
 * @param {string} code
 * @returns {Promise<boolean>}
 */
export async function isSelectableStatus(code) {
  try {
    const status = await Status.findOne({ code, selectable: true })
    return !!status
  } catch (error) {
    console.error('Errore isSelectableStatus:', error)
    return false
  }
}

/**
 * Ottieni la label di uno stato
 * @param {string} code
 * @returns {Promise<string|null>}
 */
export async function getStatusLabel(code) {
  try {
    const status = await Status.findOne({ code }).select('label').lean()
    return status?.label || null
  } catch (error) {
    console.error('Errore getStatusLabel:', error)
    return null
  }
}

/**
 * Ottieni il code di uno stato
 * @param {string} label
 * @returns {Promise<string|null>}
 */
export async function getStatusCode(label) {
  try {
    const status = await Status.findOne({ label }).select('code').lean()
    return status?.code || null
  } catch (error) {
    console.error('Errore getStatusCode:', error)
    return null
  }
}

/**
 * Ottieni uno stato per code
 * @param {string} code
 * @returns {Promise<Object|null>}
 */
export async function getStatus(code) {
  try {
    return await Status.findOne({ code }).lean()
  } catch (error) {
    console.error('Errore getStatus:', error)
    return null
  }
}