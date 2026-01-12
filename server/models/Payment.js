// server/models/Payment.js
import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
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
paymentSchema.index({ code: 1 })
paymentSchema.index({ selectable: 1 })

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema)