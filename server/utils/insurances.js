// server/utils/insurances.js - Backend Only
import Insurance from '~/server/models/Insurance'

export async function getSelectableInsurances() {
  try {
    const insurances = await Insurance.find({ selectable: true })
      .select('code label')
      .sort({ label: 1 })
      .lean()
    return insurances.map(i => ({ label: i.label, value: i.code, code: i.code }))
  } catch (error) {
    console.error('Errore getSelectableInsurances:', error)
    return []
  }
}

export async function getAllInsurances() {
  try {
    return await Insurance.find().select('code label selectable').sort({ label: 1 }).lean()
  } catch (error) {
    console.error('Errore getAllInsurances:', error)
    return []
  }
}

export async function isValidInsurance(code) {
  try {
    return await Insurance.countDocuments({ code }) > 0
  } catch (error) {
    console.error('Errore isValidInsurance:', error)
    return false
  }
}