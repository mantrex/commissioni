// server/utils/payments.js - Backend Only
import Payment from '~~/server/models/Payment'

export async function getSelectablePayments() {
  try {
    const payments = await Payment.find({ selectable: true })
      .select('code label')
      .sort({ label: 1 })
      .lean()
    return payments.map(p => ({ label: p.label, value: p.code, code: p.code }))
  } catch (error) {
    console.error('Errore getSelectablePayments:', error)
    return []
  }
}

export async function getAllPayments() {
  try {
    return await Payment.find().select('code label selectable').sort({ label: 1 }).lean()
  } catch (error) {
    console.error('Errore getAllPayments:', error)
    return []
  }
}

export async function isValidPayment(code) {
  try {
    return await Payment.countDocuments({ code }) > 0
  } catch (error) {
    console.error('Errore isValidPayment:', error)
    return false
  }
}