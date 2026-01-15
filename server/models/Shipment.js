// server/models/Shipment.js
import mongoose from 'mongoose'

const shipmentSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  selectable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Index per ricerche
shipmentSchema.index({ selectable: 1 })

export default mongoose.models.Shipment || mongoose.model('Shipment', shipmentSchema)