// server/models/Insurance.js
import mongoose from 'mongoose'

const insuranceSchema = new mongoose.Schema({
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
insuranceSchema.index({ selectable: 1 })

export default mongoose.models.Insurance || mongoose.model('Insurance', insuranceSchema)