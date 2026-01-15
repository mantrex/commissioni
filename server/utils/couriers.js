// server/utils/couriers.js - Backend Only
import Courier from '~~/server/models/Courier'

/**
 * Ottieni tutti i corrieri selezionabili per dropdown/select
 * @returns {Promise<Array<{label: string, value: string, code: string}>>}
 */
export async function getSelectableCouriers() {
  try {
    const couriers = await Courier.find({ selectable: true })
      .select('code label')
      .sort({ label: 1 })
      .lean()

    return couriers.map(c => ({
      label: c.label,
      value: c.code,
      code: c.code
    }))
  } catch (error) {
    console.error('Errore getSelectableCouriers:', error)
    return []
  }
}

/**
 * Ottieni tutti i corrieri (anche non selezionabili)
 * @returns {Promise<Array<{code: string, label: string, selectable: boolean}>>}
 */
export async function getAllCouriers() {
  try {
    return await Courier.find()
      .select('code label selectable')
      .sort({ label: 1 })
      .lean()
  } catch (error) {
    console.error('Errore getAllCouriers:', error)
    return []
  }
}

/**
 * Verifica se un corriere esiste
 * @param {string} code
 * @returns {Promise<boolean>}
 */
export async function isValidCourier(code) {
  try {
    const count = await Courier.countDocuments({ code })
    return count > 0
  } catch (error) {
    console.error('Errore isValidCourier:', error)
    return false
  }
}

/**
 * Verifica se un corriere è selezionabile
 * @param {string} code
 * @returns {Promise<boolean>}
 */
export async function isSelectableCourier(code) {
  try {
    const courier = await Courier.findOne({ code, selectable: true })
    return !!courier
  } catch (error) {
    console.error('Errore isSelectableCourier:', error)
    return false
  }
}

/**
 * Ottieni la label di un corriere dal code
 * @param {string} code
 * @returns {Promise<string|null>}
 */
export async function getCourierLabel(code) {
  try {
    const courier = await Courier.findOne({ code }).select('label').lean()
    return courier?.label || null
  } catch (error) {
    console.error('Errore getCourierLabel:', error)
    return null
  }
}

/**
 * Ottieni il code di un corriere dalla label
 * @param {string} label
 * @returns {Promise<string|null>}
 */
export async function getCourierCode(label) {
  try {
    const courier = await Courier.findOne({ label }).select('code').lean()
    return courier?.code || null
  } catch (error) {
    console.error('Errore getCourierCode:', error)
    return null
  }
}

/**
 * Ottieni un corriere per code
 * @param {string} code
 * @returns {Promise<Object|null>}
 */
export async function getCourier(code) {
  try {
    return await Courier.findOne({ code }).lean()
  } catch (error) {
    console.error('Errore getCourier:', error)
    return null
  }
}