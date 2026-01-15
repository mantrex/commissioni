// server/utils/shipments.js - Backend Only
import Shipment from '~~/server/models/Shipment'

export async function getSelectableShipments() {
  try {
    const shipments = await Shipment.find({ selectable: true })
      .select('code label')
      .sort({ label: 1 })
      .lean()
    return shipments.map(s => ({ label: s.label, value: s.code, code: s.code }))
  } catch (error) {
    console.error('Errore getSelectableShipments:', error)
    return []
  }
}

export async function getAllShipments() {
  try {
    return await Shipment.find().select('code label selectable').sort({ label: 1 }).lean()
  } catch (error) {
    console.error('Errore getAllShipments:', error)
    return []
  }
}

export async function isValidShipment(code) {
  try {
    return await Shipment.countDocuments({ code }) > 0
  } catch (error) {
    console.error('Errore isValidShipment:', error)
    return false
  }
}